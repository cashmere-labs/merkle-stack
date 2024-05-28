import { motion, useTransform } from "framer-motion"

export default function CircularProgressDeny({ progress }: { progress: any }) {
  const circleLength = useTransform(progress, [0, 100], [0, 1])

  const crossPathLength = useTransform(progress, [0, 95, 100], [0, 0, 1])

  const circleColor = useTransform(
    progress,
    [0, 95, 100],
    ["#FFCC66", "#FFCC66", "#FF6666"]
  )

  
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width="80"
      height="80"
      viewBox="0 0 258 258"
    >
      {/* Cross */}
      <motion.path
        transform="translate(129 129) scale(2)"
        d="M-20 -20L20 20M-20 20L20 -20"
        fill="transparent"
        stroke="#FF6666"
        strokeWidth={8}
        style={{ pathLength: crossPathLength }}
      />

      {/* Circle */}
      <motion.path
        d="M 130 6 C 198.483 6 254 61.517 254 130 C 254 198.483 198.483 254 130 254 C 61.517 254 6 198.483 6 130 C 6 61.517 61.517 6 130 6 Z"
        fill="transparent"
        strokeWidth="8"
        stroke={circleColor}
        style={{
          pathLength: circleLength
        }}
      />
    </motion.svg>
  )
}