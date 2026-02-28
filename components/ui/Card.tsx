import { HTMLAttributes } from "react";

type CardVariant = "default" | "ghost" | "tight";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
};

const baseClass = "nsc-card";

const variantMap: Record<CardVariant, string> = {
  default: baseClass,
  ghost: `${baseClass} nsc-card--ghost`,
  tight: `${baseClass} nsc-card--tight`,
};

export const Card = ({ variant = "default", className = "", ...rest }: CardProps) => {
  const classes = [variantMap[variant], className].filter(Boolean).join(" ");

  return <div className={classes} {...rest} />;
};
