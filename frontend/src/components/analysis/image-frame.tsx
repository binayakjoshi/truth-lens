import Image from "next/image";

import { Box } from "@mui/material";

export default function ImageFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: "1 / 1",
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "action.hover",
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 900px) 100vw, 380px"
        style={{ objectFit: "contain" }}
      />
    </Box>
  );
}
