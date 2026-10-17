import React, { type ReactNode } from "react";
import Head from "@docusaurus/Head";
import BlogTagsListPage from "@theme-original/BlogTagsListPage";
import type BlogTagsListPageType from "@theme/BlogTagsListPage";
import type { WrapperProps } from "@docusaurus/types";

type Props = WrapperProps<typeof BlogTagsListPageType>;

/** The tag index is navigation, not content: see BlogTagsPostsPage. */
export default function BlogTagsListPageWrapper(props: Props): ReactNode {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex, follow" />
      </Head>
      <BlogTagsListPage {...props} />
    </>
  );
}
