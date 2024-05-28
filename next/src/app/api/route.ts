import jwt from "jsonwebtoken";
import { NextResponse, NextRequest} from "next/server";
export const dynamic = 'force-dynamic' // defaults to auto

type ResponseData = {
    message: string
  }
  
function countZeros(str: string): number {
    let count = 0;
    for (let i = 0; i < str.length; i++) {
        if (str[i] === '0') {
            count++;
        }
    }
    return count;
  }
  
  

export async function POST(req:Request) {
  if (req.method !== "POST") {
    return NextResponse.json({ message: "not suppported" },{ status: 405 });
  }

  const secret = process.env.JWT_SECRET;
  const seed_1 = Number(process.env.SEED_1);
  const seed_2 = Number(process.env.SEED_2);

  const data = await req.json();
  const address = data.address1
  const signature = data.signature
  const message = data.messageSing

  const zerosCount = countZeros(data.address1?.toString()) + seed_1;
  const timestamp = data.timestamp;
  const messageSing = timestamp-((timestamp - zerosCount) % seed_2)

  if (!data.address1 || !data.signature || messageSing != message || !data.timestamp || !data.messageSing) {
    return NextResponse.json({ message: "address and signature reuqired" },{ status: 400 });
  }
  
  try {
    const payload = { address, signature, timestamp};
    if(secret != undefined){
        const token = jwt.sign(payload, secret, { expiresIn: "1h" });
        
        return NextResponse.json({ message: token },{ status: 200 });
    }
    
    

    
  } catch (error) {
    return NextResponse.json({ message: "Error Occured" },{ status: 500 });
  }
}