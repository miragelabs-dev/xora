import { PageHeader } from "@/components/page-header";
import { PostDetailView } from "@/components/post-detail-view";
import { getPostForMetadata } from "@/server/utils/get-post-for-metadata";
import { Metadata } from "next";

type Params = Promise<{ userUsername: string, postId: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { userUsername, postId } = await params;
  const postIdNum = parseInt(postId);

  const post = await getPostForMetadata(postIdNum);

  if (!post) {
    return {
      title: `Post by @${userUsername} • Xora`,
      description: `View this post by @${userUsername} on Xora`,
    };
  }

  const cleanContent = post.content
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const title = cleanContent.length > 40
    ? `${post.authorUsername}: "${cleanContent.substring(0, 40)}..."`
    : `${post.authorUsername}: "${cleanContent}"`;

  const description = cleanContent.length > 120
    ? `${cleanContent.substring(0, 120)}... • See more on Xora`
    : `${cleanContent} • View on Xora`;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const postUrl = `${baseUrl}/${userUsername}/status/${postId}`;

  const ogImageParams = new URLSearchParams({
    title: cleanContent.substring(0, 100),
    author: `@${post.authorUsername}`,
    ...(post.authorImage && { avatar: post.authorImage }),
    ...(post.authorIsVerified && { verified: 'true' }),
    time: new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }),
    likes: String(post.likesCount || 0),
    replies: String(post.repliesCount || 0),
    reposts: String(post.repostsCount || 0),
  });

  const ogImage = post.image || `${baseUrl}/api/og?${ogImageParams.toString()}`;
  if (!ogImage) {
    return {
      title: `${title} • Xora`,
      description,
    };
  }

  return {
    title: `${title} • Xora`,
    description,
    metadataBase: new URL(baseUrl || 'https://xora.social'),
    openGraph: {
      title,
      description,
      url: postUrl,
      siteName: 'Xora',
      type: 'article',
      publishedTime: post.createdAt?.toISOString(),
      authors: [`@${post.authorUsername}`],
      images: [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: `Post by @${post.authorUsername}: ${cleanContent.substring(0, 50)}`,
        type: 'image/png',
      }],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@xora',
      creator: `@${post.authorUsername}`,
      title,
      description,
      images: {
        url: ogImage,
        alt: `Post by @${post.authorUsername}`,
      },
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  };
}

export default async function PostPage({ params }: { params: Params }) {
  const { postId } = await params;

  return (
    <div>
      <PageHeader title="Post" />
      <PostDetailView postId={postId} />
    </div>
  );
} 