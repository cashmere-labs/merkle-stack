import React from "react";
import { TwitterShareButton } from "next-share";
import { Button } from "@chakra-ui/react";
type TweetProps = {
  GoatPoint: string | null;
};

const Tweet: React.FC<TweetProps> = ({ GoatPoint }) => {
  return (
    <div>
      {/* Facebook Share Button */}
      <TwitterShareButton
        url={"https://points.cashmere.exchange/"}
        title={
          "I've claimed " + GoatPoint + " GoatPoints!🐐 Discover if you're eligible to claim points:"
        }
        //hashtags={["mbeek", "cashmere", "GOAT"]}
        blankTarget={true}
      >
        <Button variant="outline">Tweet About Us</Button>
      </TwitterShareButton>
    </div>
  );
};

export default Tweet;
