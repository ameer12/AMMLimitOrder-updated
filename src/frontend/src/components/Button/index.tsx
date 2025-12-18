import cn from "classnames";
import React from "react";
import styles from "./index.module.scss";

enum ButtonType {
  Primary="primary", Secondary="secondary",
  PrimarySmall="primarySmall", SecondarySmall="secondarySmall",
  PrimaryLarge="primaryLarge", SecondaryLarge="secondaryLarge"
}

type Props =
React.DetailedHTMLProps<
React.ButtonHTMLAttributes<HTMLButtonElement>,
HTMLButtonElement
>
& {
  title:string,
  loading?:boolean,
  disabled?:boolean,
  buttonType?:ButtonType|string
};

export default function Button({ title,buttonType,loading,className,disabled, ...props }:Props) {
  return <button
    className={cn({
      [styles.button]:true,
      [styles.primary]: buttonType === undefined || buttonType === ButtonType.Primary,
      [styles.primaryLarge]: buttonType === ButtonType.PrimaryLarge,
      [styles.secondary]: buttonType === ButtonType.Secondary,
      [styles.secondaryLarge]: buttonType === ButtonType.SecondaryLarge,
      [styles.primarySmall]: buttonType === ButtonType.PrimarySmall,
      [styles.secondarySmall]: buttonType === ButtonType.SecondarySmall,
      [styles.loading]: loading,
      [styles.disabled]: disabled,
      [className??""]: !!className,
    })}
    type="button" {...props}>{ title }</button>;
}
