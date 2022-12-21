import Image from "next/image";

const Icon = ({ token }: { token: string }) => {
  return (
    <Image
      src={`/tokens/${token}.png`}
      alt="token image"
      width={26}
      height={26}
    />
  );
};

export default Icon;
