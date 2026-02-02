# Sugartown CMS - Quick Reference Guide

Essential GROQ queries and common operations for Sugartown CMS.

## 🔍 Common GROQ Queries

### Knowledge Graph Nodes

#### Get all nodes ordered by date
```groq
*[_type == "node"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  aiTool,
  conversationType,
  status,
  challenge,
  insight,
  publishedAt
}
```

#### Get nodes by AI tool
```groq
*[_type == "node" && aiTool == "claude"] | order(publishedAt desc) {
  title,
  slug,
  challenge,
  insight,
  status
}
```

#### Get nodes by status
```groq
*[_type == "node" && status == "implemented"] {
  title,
  slug,
  actionItem,
  relatedProjects[]->{
    projectId,
    name
  }
}
```

#### Get nodes with categories
```groq
*[_type == "node"] | order(publishedAt desc) {
  title,
  slug,
  categories[]->{
    name,
    slug,
    "color": color.hex
  }
}
```

### Blog Posts

#### Get all posts with featured images
```groq
*[_type == "post"] | order(publishedAt desc) {
  title,
  slug,
  excerpt,
  featuredImage {
    asset->,
    alt,
    caption
  },
  author,
  publishedAt
}
```

#### Get posts by category
```groq
*[_type == "post" && references($categoryId)] | order(publishedAt desc) {
  title,
  slug,
  excerpt,
  categories[]->{
    name,
    slug
  }
}
```

### Pages

#### Get page with all sections
```groq
*[_type == "page" && slug.current == $slug][0] {
  title,
  template,
  sections[]{
    _type,
    _type == "hero" => {
      heading,
      subheading,
      backgroundImage {
        asset->,
        alt
      },
      cta {
        text,
        link {
          url,
          label,
          openInNewTab
        },
        style
      }
    },
    _type == "textSection" => {
      heading,
      content
    },
    _type == "imageGallery" => {
      layout,
      images[] {
        asset->,
        alt,
        caption
      }
    },
    _type == "ctaSection" => {
      heading,
      description,
      buttons[] {
        text,
        link {
          url,
          label
        },
        style
      }
    }
  },
  "seoTitle": coalesce(seo.metaTitle, title),
  "seoDescription": seo.metaDescription,
  "ogImage": seo.ogImage.asset->
}
```

#### Get page hierarchy
```groq
*[_type == "page" && !defined(parent)] {
  title,
  slug,
  "children": *[_type == "page" && parent._ref == ^._id] {
    title,
    slug
  }
}
```

### Case Studies

#### Get all case studies
```groq
*[_type == "caseStudy"] | order(publishedAt desc) {
  title,
  slug,
  client,
  role,
  excerpt,
  featuredImage {
    asset->,
    alt
  },
  dateRange,
  categories[]->{
    name,
    slug
  },
  tags[]->{
    name,
    slug
  }
}
```

### Projects

#### Get active projects with KPIs
```groq
*[_type == "project" && status == "active"] | order(priority asc) {
  projectId,
  name,
  description,
  priority,
  kpis[] {
    metric,
    target,
    current
  },
  tags[]->{
    name
  }
}
```

#### Get content linked to a project
```groq
{
  "project": *[_type == "project" && projectId == $projectId][0] {
    projectId,
    name,
    description,
    status
  },
  "nodes": *[_type == "node" && references(*[_type == "project" && projectId == $projectId][0]._id)] {
    title,
    slug,
    aiTool,
    status,
    publishedAt
  },
  "posts": *[_type == "post" && references(*[_type == "project" && projectId == $projectId][0]._id)] {
    title,
    slug,
    publishedAt
  },
  "caseStudies": *[_type == "caseStudy" && references(*[_type == "project" && projectId == $projectId][0]._id)] {
    title,
    slug,
    client,
    publishedAt
  }
}
```

### Categories & Tags

#### Get category with color
```groq
*[_type == "category"] | order(name asc) {
  _id,
  name,
  slug,
  "color": color.hex,
  parent->{
    name,
    slug
  }
}
```

#### Get all tags
```groq
*[_type == "tag"] | order(name asc) {
  _id,
  name,
  slug
}
```

#### Get content count by tag
```groq
*[_type == "tag"] {
  name,
  slug,
  "nodeCount": count(*[_type == "node" && references(^._id)]),
  "postCount": count(*[_type == "post" && references(^._id)]),
  "caseStudyCount": count(*[_type == "caseStudy" && references(^._id)])
}
```

### Navigation

#### Get navigation menu
```groq
*[_type == "navigation" && title == $menuTitle][0] {
  title,
  items[] {
    label,
    link {
      url,
      openInNewTab,
      icon
    },
    children[] {
      label,
      link {
        url,
        openInNewTab
      }
    }
  }
}
```

### Site Settings

#### Get site settings (singleton)
```groq
*[_type == "siteSettings"][0] {
  siteTitle,
  siteLogo {
    asset->
  },
  "brandPink": brandColors.pink.hex,
  "brandSeafoam": brandColors.seafoam.hex,
  headerStyle,
  primaryNav->{
    title,
    items
  },
  headerCta,
  announcementBar,
  footerColumns[]->{
    title,
    items
  },
  socialLinks,
  copyrightText,
  defaultMetaTitle,
  defaultMetaDescription,
  defaultOgImage {
    asset->
  }
}
```

## 🎨 Image URLs with Sanity Image URLs

### Using @sanity/image-url (recommended)

```javascript
import imageUrlBuilder from '@sanity/image-url'
import {sanityClient} from './sanityClient'

const builder = imageUrlBuilder(sanityClient)

function urlFor(source) {
  return builder.image(source)
}

// Usage examples:
const imageUrl = urlFor(image.asset).width(800).url()
const croppedUrl = urlFor(image.asset).width(400).height(300).fit('crop').url()
const blurUrl = urlFor(image.asset).width(20).blur(50).url()
```

### GROQ Image Transform (in query)

```groq
*[_type == "post"][0] {
  title,
  featuredImage {
    "url": asset->url,
    "metadata": asset->metadata,
    alt
  }
}
```

## 📝 Content Creation Examples

### Create a Node

```javascript
const newNode = {
  _type: 'node',
  title: 'Debugging React State with Claude',
  slug: {
    _type: 'slug',
    current: 'debugging-react-state-claude'
  },
  excerpt: 'Used Claude to solve a tricky state management bug in React.',
  aiTool: 'claude',
  conversationType: 'debug',
  challenge: 'React component not re-rendering when state changed',
  insight: 'State updates were being batched incorrectly due to closure issues',
  actionItem: 'Refactor to use useReducer for complex state',
  status: 'implemented',
  publishedAt: new Date().toISOString(),
  categories: [
    {_type: 'reference', _ref: 'category-react-id'}
  ],
  tags: [
    {_type: 'reference', _ref: 'tag-debugging-id'},
    {_type: 'reference', _ref: 'tag-react-id'}
  ]
}

// Using Sanity client
await client.create(newNode)
```

### Create a Project

```javascript
const newProject = {
  _type: 'project',
  projectId: 'PROJ-001',
  name: 'Sugartown CMS Migration',
  description: 'Migrate from WordPress to Sanity headless CMS',
  status: 'active',
  priority: 1,
  kpis: [
    {
      _type: 'kpi',
      _key: 'kpi-1',
      metric: 'Content migrated',
      target: '100 posts',
      current: '42 posts'
    }
  ]
}

await client.create(newProject)
```

## 🔄 Common Mutations

### Update Node Status

```javascript
await client
  .patch(nodeId)
  .set({ status: 'implemented' })
  .commit()
```

### Add Category to Post

```javascript
await client
  .patch(postId)
  .setIfMissing({ categories: [] })
  .insert('after', 'categories[-1]', [{
    _type: 'reference',
    _ref: categoryId,
    _key: generateKey()
  }])
  .commit()
```

### Update Project KPI

```javascript
await client
  .patch(projectId)
  .set({
    'kpis[_key == "kpi-1"].current': '75 posts'
  })
  .commit()
```

## 🎯 Search Queries

### Full-text search across content types

```groq
*[
  (_type == "node" || _type == "post" || _type == "page") &&
  (
    title match $searchTerm + "*" ||
    excerpt match $searchTerm + "*"
  )
] {
  _type,
  title,
  slug,
  excerpt
}
```

### Search nodes by challenge or insight

```groq
*[_type == "node" && (
  challenge match $searchTerm + "*" ||
  insight match $searchTerm + "*"
)] {
  title,
  slug,
  challenge,
  insight,
  aiTool
}
```

## 📊 Analytics Queries

### Content count by type

```groq
{
  "nodeCount": count(*[_type == "node"]),
  "postCount": count(*[_type == "post"]),
  "pageCount": count(*[_type == "page"]),
  "caseStudyCount": count(*[_type == "caseStudy"])
}
```

### Nodes by AI tool distribution

```groq
{
  "claude": count(*[_type == "node" && aiTool == "claude"]),
  "chatgpt": count(*[_type == "node" && aiTool == "chatgpt"]),
  "gemini": count(*[_type == "node" && aiTool == "gemini"]),
  "mixed": count(*[_type == "node" && aiTool == "mixed"])
}
```

### Recent activity timeline

```groq
*[_type in ["node", "post", "caseStudy"]] | order(publishedAt desc) [0...10] {
  _type,
  title,
  slug,
  publishedAt,
  _type == "node" => {
    aiTool,
    status
  }
}
```

## 🚀 Performance Tips

1. **Use projections** - Only select fields you need
2. **Limit results** - Use `[0...10]` to paginate
3. **Index references** - Sanity auto-indexes references
4. **Avoid deep nesting** - Keep queries shallow when possible
5. **Cache results** - Use SWR or React Query for frontend

## 🔗 Useful Links

- [GROQ Cheat Sheet](https://www.sanity.io/docs/query-cheat-sheet)
- [GROQ Playground](https://www.sanity.io/docs/groq-playground)
- [Vision Tool](https://www.sanity.io/docs/the-vision-plugin)
- [Sanity Client Docs](https://www.sanity.io/docs/js-client)

---

**Pro Tip:** Use the Vision plugin in Sanity Studio to test these queries interactively!
