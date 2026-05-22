import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl ring-1 ring-slate-200/70 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-900">
            Thank you for signing up!
          </CardTitle>
          <CardDescription className="text-slate-600">
            Check your email to confirm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            You&apos;ve successfully signed up. Please check your email to
            confirm your account before signing in.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
