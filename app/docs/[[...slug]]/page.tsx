import { source } from '@/lib/source';
import { openapi } from '@/lib/openapi';
import { OpenAPIPage } from '@/components/api-page';
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/mdx-components';

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDXContent = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDXContent
          components={getMDXComponents({
            OpenAPIPage: async (mdxProps: Record<string, unknown>) => {
              const preloaded = await openapi.preloadOpenAPIPage(page);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              return <OpenAPIPage {...(preloaded as any)} {...mdxProps} />;
            },
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

// 未命中上面 generateStaticParams() 列表的路径直接走 404 静态兜底，不再尝试按需动态渲染
// ——避免请求触发 lib/openapi.ts 的模块级 readdirSync 在部署环境里因目录缺失而抛出未捕获异常。
export const dynamicParams = false;

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
