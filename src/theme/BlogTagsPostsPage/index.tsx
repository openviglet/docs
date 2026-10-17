import React, { type ReactNode } from "react";
import Head from "@docusaurus/Head";
import BlogTagsPostsPage from "@theme-original/BlogTagsPostsPage";
import type BlogTagsPostsPageType from "@theme/BlogTagsPostsPage";
import type { WrapperProps } from "@docusaurus/types";

type Props = WrapperProps<typeof BlogTagsPostsPageType>;

/**
 * A tag page only lists posts, yet it ranked in their place (/blog/tags/aem/ for
 * "aem search engine"). noindex keeps it out of search and out of the sitemap;
 * follow keeps its links to the posts counting.
 */
export default function BlogTagsPostsPageWrapper(props: Props): ReactNode {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex, follow" />
      </Head>
      <BlogTagsPostsPage {...props} />
    </>
  );
}
