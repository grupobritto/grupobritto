import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <main className="flex h-screen items-center justify-center bg-(--color-background-geral)">
        <div className="w-[350px] space-y-2">
          <Input
            type="text"
            placeholder="Username"
            className="w-full border-none text-(--color-highlight) outline"
          />
          <Input
            type="password"
            placeholder="Password"
            className="w-full border-none text-(--color-highlight) outline"
          />
          <div className="flex items-center space-x-1">
            <Checkbox className="" />
            <Label className="text-sm font-light">Remember user</Label>
          </div>
          <Button
            variant={'outline'}
            type="submit"
            className="w-full hover:bg-(--color-highlight) hover:text-(--color-highlight)"
          >
            Log-in
          </Button>
          <div className="flex flex-col space-y-2">
            <Button className="w-full">
              <Link href={'/register'} className="w-full text-sm">
                Register
              </Link>
            </Button>
            <Button className="w-full">
              <Link href={'/recovery'} className="w-full text-sm">
                Forget my password
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
