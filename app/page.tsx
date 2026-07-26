import Link from 'next/link';
import { baseOptions } from '@/app/layout.config';
import { HomeLayout } from 'fumadocs-ui/layouts/home';

export default function HomePage() {
  return (
    <HomeLayout {...baseOptions}>
      <main className="mx-auto flex max-w-3xl flex-1 flex-col justify-center gap-6 px-6 py-24 text-center">
        <h1 className="text-4xl font-semibold">bytestream 接入文档</h1>
        <p className="text-fd-muted-foreground">
          基于 new-api 搭建的 AI 中转站，覆盖文本生成与视频生成两大能力的完整对接说明。
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/docs/text"
            className="rounded-full bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground"
          >
            文本生成对接指南
          </Link>
          <Link
            href="/docs/video"
            className="rounded-full border px-5 py-2.5 text-sm font-medium"
          >
            视频生成对接指南
          </Link>
        </div>
      </main>
    </HomeLayout>
  );
}
