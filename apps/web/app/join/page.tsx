import Image from "next/image";
import { JoinEntry } from "@/components/join-entry";
import SigninButton from "@/components/sign-in-btn";
import { ExpandingButtonGroup } from "@/components/expanding-button-group";

export default function Join() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <Image
          src="/home-bg.png"
          alt="Background Image"
          fill
          priority
          className="object-cover"
        />
        <section className="flex flex-col gap-4 z-10">
          <JoinEntry />
          <SigninButton />
          <ExpandingButtonGroup />
        </section>
      </div>
    );
}