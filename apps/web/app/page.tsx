
import Image from "next/image";


export default function Home() {

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Image
        src="/home-bg.png"
        alt="Background Image"
        fill
        priority
        className="object-cover"
      />
      <section className="flex z-10">
        
      </section>
    </div>
  );
}
