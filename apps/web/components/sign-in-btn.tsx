import Link from "next/link";
import { Button } from "./ui/button";
import { IconUserFilled } from "@tabler/icons-react";

export default function signinButton() {
    return (
        <div className="absolute top-0 right-0 p-4">
            
            <Link href="/sign-in" className="text-white/80">
                <Button className="bg-red-700/20 backdrop-blur-xs border-2 border-red-400/30 rounded-full w-11 h-11 hover:bg-black/70 hover:border-red-400/30">
                    <IconUserFilled className="h-5 w-5" />
                </Button>
            </Link>
            
      </div>
    )
}