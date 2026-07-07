"use client";

import Link from "next/link";

import Button, { type ButtonProps } from "@mui/material/Button";

interface LinkButtonProps extends ButtonProps {
  href: string;
}

export default function LinkButton({ href, ...props }: LinkButtonProps) {
  return <Button component={Link} href={href} {...props} />;
}
