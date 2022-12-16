import React, { forwardRef } from "react";
import Image from "next/image";

type SelectItemProps = {
  label: string;
  value: string;
  image: string;
};

const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  // ** How does `...others` work here?
  ({ label, value, image, ...others }: SelectItemProps, ref) => {
    return (
      <div ref={ref} {...others}>
        <Image src={image} alt="token image" width={25} height={25} />
        <p>{label}</p>
      </div>
    );
  }
);

export default SelectItem;
