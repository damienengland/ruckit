'use client'

import { useRouter } from "next/navigation";
import { generateSessionCode } from "@/lib/session-code";
import { Button } from "@/components/ui/button";

export function CreateSessionBtn() {

    const router = useRouter()

    const handleCreateSession = () => {
        const code = generateSessionCode();
        router.push(`/host/${code}`);
    };

    return (
        <Button
          size="lg"
          variant="outline"
          className="w-50 h-20"
          onClick={handleCreateSession}
        >
            Create
        </Button>
    )
}