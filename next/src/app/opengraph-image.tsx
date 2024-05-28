// app/hello-today/opengraph-image.tsx
import { ImageResponse } from "next/og";
import {
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ReactPortal,
  AwaitedReactNode,
} from "react";

export const size = {
  width: 1200,
  height: 630,
};



export default function Image1({ params }: { params: { name: string } }) {

  return new ImageResponse(
    (
      <div style={{
        height: "100%",
        width: "100%",
        display: "flex"}}>
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "black",
            color:  "transparent",
            fontSize: 32,
            fontWeight: 600,
          }}
        >
          <img
            src="https://pbs.twimg.com/profile_images/1551945866793164802/KmcIMByo_400x400.jpg"
            alt=""
            height="250px"
            width="250px"
            style={{ height: "250px",width:"250px"}}
          />
        </div>
        
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
