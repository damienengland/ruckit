
import Image from "next/image";
import { ExpandingButtonGroup } from "@/components/expanding-button-group";
import { Logo } from "@/components/logo";
import SigninButton from "@/components/sign-in-btn";

export default function Home() {

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <Image
        src="/home-bg.png"
        alt="Background Image"
        fill
        priority
        className="object-cover"
      />
      <div className="w-full h-fit flex items-center bg-red-700/20 backdrop-blur-xs border-b-2 border-red-400/30 z-50 ">
        <div className="flex gap-4 w-fit p-4">
          <Logo size="md" className="pt-2" />
          <ExpandingButtonGroup />
        </div>
        <div className="flex gap-4 w-fit">
          <SigninButton />  
        </div>
      </div>
    </div>
  );
}
