# My Go API Project

This project contains an API written in Go. To run the project, you need to define the necessary environment variables. Additionally, you can use Docker Compose and Dockerfile for an easy setup if you prefer.

## Setup Instructions

### 1. Define Environment Variables

To run the project, you need to define the required environment variables in a `.env` file. Here is an example of what your `.env` file should look like:

```env
MONGO_URI=your_mongo_uri_here
JWT_SECRET=your_jwt_secret_here
```

Rename the `env.example` file to `.env` and replace the placeholder values with your actual values.

### 2. Running the Project

You can run the project directly with Go or use Docker for a simplified setup. Follow the instructions below:

#### Running Directly with Go

1. Make sure you have Go installed on your machine.
2. Navigate to the project directory.
3. Ensure your environment variables are set. You can use the following command to export them in your terminal:

    ```sh
    export $(cat .env | xargs)
    ```

4. Run the Go application with:

    ```sh
    go run main.go
    ```



#### Using Docker Compose

1. Make sure you have Docker and Docker Compose installed on your machine.
2. Create a `docker-compose.yml` file in the root of your project.
3. Add the necessary services and configuration to the `docker-compose.yml` file, specifying the `app` and `mongo` services.
4. Run the following command to start the services:

    ```sh
    docker-compose up --build
    ```



#### Using Dockerfile

1. Create a `Dockerfile` in the root of your project.
2. Add the necessary instructions to the `Dockerfile` to build your Go application.
3. Build the Docker image with the following command:

    ```sh
    docker build -t my-go-api .
    ```

4. Run the Docker container with the following command:

    ```sh
    docker run --env-file .env -p 8080:8080 my-go-api
    ```

## Accessing the API

Once the project is running, you can access the API at `http://localhost:8080`.

## Conclusion

By following these steps, you should be able to set up and run your Go API project easily. If you have any questions or encounter any issues, feel free to open an issue or contact the maintainers.

