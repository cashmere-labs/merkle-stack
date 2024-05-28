package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// consts
const (
	dbName     = "tree_2"
	tokenField = "Authorization" // jwt domain
)

// leaf struct
type LeafData struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	Index     int                `bson:"index"`
	Value     []string           `bson:"value"`
	TreeIndex int                `bson:"treeIndex"`
}

// tree struct
type TreeNode struct {
	ID    primitive.ObjectID `bson:"_id,omitempty"`
	Index int                `bson:"index"`
	Hash  string             `bson:"0"`
}

// findIndexes find indexes of address
func findIndexes(index int) []int {
	indexList := []int{}
	for index > 0 {
		indexList = append(indexList, siblingIndex(index))
		index = parentIndex(index)
	}
	return indexList
}

// calculates sibling indexes
func siblingIndex(i int) int {
	z := float64(i % 2)
	x := float64(z)
	return i - int(math.Pow(-1, x))
}

// parentIndex
func parentIndex(i int) int {
	return int(math.Floor(float64((i - 1)) / 2))
}

func getProof(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version,Authorization")
	w.Header().Set("Content-Type", "application/json")

	tokenString := r.URL.Query().Get("token12")
	if tokenString == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	// get address
	BigAddr := r.URL.Query().Get("address")
	address := strings.ToLower(BigAddr)
	// jwt verification
	err := verifyToken(tokenString, address)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// MongoDB connection
	mongoURI := os.Getenv("MONGO_URI")
	client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(context.TODO())

	// fb and collections
	db := client.Database(dbName)
	addressListCollection := db.Collection("address_list")
	treeCollection := db.Collection("tree")

	// find leaf
	var leafData LeafData
	regex := `(?i).*` + address + `.*`
	filter := bson.M{"value.0": bson.M{"$regex": regex}}
	err = addressListCollection.FindOne(context.TODO(), filter).Decode(&leafData)
	if err != nil {
		// error
		response := struct {
			Eligible bool   `json:"eligible"`
			Error    string `json:"error,omitempty"`
		}{
			Eligible: false,
			Error:    err.Error(),
		}
		jsonResponse, err := json.Marshal(response)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(jsonResponse)
		return
	}

	// find indexes for proof
	indexes := findIndexes(leafData.TreeIndex)
	var treeNodes []TreeNode
	filter = bson.M{"index": bson.M{"$in": indexes}}
	opts := options.Find().SetSort(bson.D{{Key: "index", Value: -1}})
	cur, err := treeCollection.Find(context.TODO(), filter, opts)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cur.Close(context.TODO())
	err = cur.All(context.TODO(), &treeNodes)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	proof := make([]string, len(treeNodes))
	for i, node := range treeNodes {
		proof[i] = node.Hash
	}

	response := struct {
		Eligible bool     `json:"eligible"`
		Value    []string `json:"value"`
		Proof    []string `json:"proof"`
	}{
		Eligible: true,
		Value:    leafData.Value,
		Proof:    proof,
	}
	jsonResponse, err := json.Marshal(response)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Write(jsonResponse)
}

func verifyToken(tokenString string, address string) error {
	secretKey := os.Getenv("JWT_SECRET")
	// Parse the token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(secretKey), nil
	})

	if err != nil {
		return err
	}

	// Check if token is valid
	if !token.Valid {
		return fmt.Errorf("invalid token")
	}

	// Extract claims from the token
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return fmt.Errorf("invalid token claims")
	}

	// Check if the 'address' claim exists
	jwtAddress, ok := claims["address"].(string)
	if !ok {
		return fmt.Errorf("address claim not found")
	}

	jwtAddress = strings.ToLower(jwtAddress)

	// Compare addresses
	if jwtAddress != address {
		return fmt.Errorf("address mismatch")
	}

	// Address matches, token is valid
	return nil
}
func enableCORS(next http.Handler) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		// Allow requests from any origin

		w.Header().Set("Access-Control-Allow-Origin", "*")

		// Allow specified HTTP methods

		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

		// Allow specified headers

		w.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept")

		// Continue with the next handler

		next.ServeHTTP(w, r)

	})

}

func main() {
	port := os.Getenv("PORT")
	router := mux.NewRouter()
	router.Use(enableCORS)
	router.HandleFunc("/getproof", getProof)
	fmt.Println("Server initializing..." + port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}
