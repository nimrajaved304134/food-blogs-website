import Image from "next/image";
import React from "react";
import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import { PortableText } from "next-sanity";

export const revalidate = 10; // Revalidate every 10 seconds

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

export default async function Post({ params }: Params) {
  // Await the `params` promise to get the slug
  const { slug } = await params;

  // Query for fetching post data
  const query = `*[_type == "post" && slug.current == $slug]{
    title, summary, image, content,
    author->{bio, image, name}
  }[0]`;

  const post = await client.fetch(query, { slug });

  // Handle missing post data
  if (!post) {
    return (
      <div className="mt-12 mb-24 px-2 text-center">
        <h1 className="text-2xl font-bold">Post Not Found</h1>
        <p className="text-base">
          The blog post you're looking for doesnot exist.
        </p>
      </div>
    );
  }

  // Render the blog post
  return (
    <article className="mt-12 mb-24 px-2 2xl:px-12 flex flex-col gap-y-8 bg-rose-100">
      {/* Blog Title */}
      <h1 className="text-xl xs:text-3xl lg:text-5xl font-bold text-dark dark:text-light">
        {post.title}
      </h1>

      {/* Featured Image */}
      {post.image && (
        <Image
          src={urlForImage(post.image)} // Ensure it returns a valid URL
          width={500}
          height={500}
          alt={post.title || "Featured Image"}
          className="rounded"
        />
      )}

      {/* Blog Summary Section */}
      <section>
        <h2 className="text-xl xs:text-2xl md:text-3xl font-bold uppercase text-yellow-400">
          Summary
        </h2>
        <p className="text-base md:text-xl leading-relaxed text-justify text-dark/80 dark:text-light/80">
          {post.summary}
        </p>
      </section>

      {/* Author Section */}
      {post.author && (
        <section className="px-2 sm:px-8 md:px-12 lg:px-14 flex gap-2 xs:gap-4 sm:gap-6 items-start xs:items-center justify-start">
          {post.author.image && (
            <Image
              src={urlForImage(post.author.image)}
              width={200}
              height={200}
              alt={post.author.name || "Author"}
              className="object-cover rounded-full h-12 w-12 sm:h-24 sm:w-24"
            />
          )}
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-bold text-dark dark:text-light">
              {post.author.name}
            </h3>
            <p className="italic text-xs xs:text-sm sm:text-base text-dark/80 dark:text-light/80">
              {post.author.bio}
            </p>
          </div>
        </section>
      )}

      {/* Blog Content Section */}
      <section className="text-lg leading-normal text-dark/80 dark:text-light/80">
        {post.content ? (
          <PortableText value={post.content} />
        ) : (
          <p>No content available for this post.</p>
        )}
      </section>
    </article>
  );
}