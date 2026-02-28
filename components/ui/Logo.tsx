import Image from "next/image";
import { HTMLAttributes } from "react";

type LogoSize = "sm" | "md" | "lg";

const sizeMap: Record<LogoSize, number> = {
  sm: 48,
  md: 72,
  lg: 96,
};

type LogoProps = HTMLAttributes<HTMLDivElement> & {
  size?: LogoSize;
  priority?: boolean;
};

export const Logo = ({ size = "md", priority = false, className = "", ...rest }: LogoProps) => {
  const dimension = sizeMap[size];
  const classes = ["nsc-logo", className].filter(Boolean).join(" ");

  return (
    <div className={classes} {...rest}>
      <Image
        src="/nsc-logo.jpg"
        alt="Newcastle Sunday Club"
        width={dimension}
        height={dimension}
        priority={priority}
        className="nsc-logo__image"
      />
    </div>
  );
};
