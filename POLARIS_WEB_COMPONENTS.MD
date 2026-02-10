---
title: Page
description: ' Use `s-page` as the main container for placing content in your app. Page comes with preset layouts and automatically adds spacing between elements.'
api_name: app-home
source_url:
  html: 'https://shopify.dev/docs/api/app-home/polaris-web-components/structure/page'
  md: >-
    https://shopify.dev/docs/api/app-home/polaris-web-components/structure/page.md
---

# Page

Use `s-page` as the main container for placing content in your app. Page comes with preset layouts and automatically adds spacing between elements.

## Properties

Use as the outer wrapper of a page

* heading

  string

  The main page heading

* inlineSize

  "small" | "base" | "large"

  Default: 'base'

  The inline size of the page

  * `base` corresponds to a set default inline size
  * `large` full width with whitespace

## Slots

* aside

  HTMLElement

  The content to display in the aside section of the page.

  This slot is only rendered when `inlineSize` is "base".

* breadcrumb-actions

  HTMLElement

  Navigations back actions for the page.

  Only accepts `Link` components.

* children

  HTMLElement

  The content of the Page.

* primary-action

  HTMLElement

  The primary action for the page.

  Only accepts a single `Button` component with a `variant` of `primary`.

* secondary-actions

  HTMLElement

  Secondary actions for the page.

  Only accepts `ButtonGroup` and `Button` components with a `variant` of `secondary` or `auto`.

Examples

### Examples

* ####

  ##### jsx

  ```jsx
  <s-page heading="Products">
    <s-section>
      <s-text>Hello World</s-text>
    </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <s-page heading="Products">
    <s-section>
      <s-text>Hello World</s-text>
    </s-section>
  </s-page>
  ```

* #### Page with heading

  ##### Description

  Shows a page with a clear heading and descriptive text, illustrating how to use the page component with a title.

  ##### jsx

  ```jsx
  <s-page heading="Product catalog" inlineSize="base">
    <s-section>
      <s-text>Manage your product catalog and inventory.</s-text>
    </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <s-page heading="Product catalog" inline-size="base">
    <s-section>
      <s-text>Manage your product catalog and inventory.</s-text>
    </s-section>
  </s-page>
  ```

* #### Small inline size for focused content

  ##### Description

  Illustrates a page with a small inline size, ideal for focused, compact content like settings or forms with minimal information.

  ##### jsx

  ```jsx
  <s-page heading="Store settings" inlineSize="small">
    <s-section>
      <s-stack gap="base">
        <s-text>Configure your basic store preferences.</s-text>
        <s-text-field label="Store name" />
        <s-button variant="primary">Save</s-button>
      </s-stack>
    </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <s-page heading="Store settings" inline-size="small">
    <s-section>
      <s-stack gap="base">
        <s-text>Configure your basic store preferences.</s-text>
        <s-text-field label="Store name"></s-text-field>
        <s-button variant="primary">Save</s-button>
      </s-stack>
    </s-section>
  </s-page>
  ```

* #### Large inline size for wide content

  ##### Description

  Demonstrates a page with a large inline size, perfect for displaying broader content like analytics or dashboards with multiple information sections.

  ##### jsx

  ```jsx
  <s-page heading="Store analytics" inlineSize="large">
    <s-section>
      <s-stack gap="base">
        <s-text>Monitor your store performance across all channels.</s-text>
        <s-grid>
          <s-grid-item>
            <s-box
              padding="base"
              background="base"
              borderWidth="base"
              borderColor="base"
              borderRadius="base"
            >
              <s-heading>Sales</s-heading>
              <s-text type="strong">$12,456</s-text>
            </s-box>
          </s-grid-item>
          <s-grid-item>
            <s-box
              padding="base"
              background="base"
              borderWidth="base"
              borderColor="base"
              borderRadius="base"
            >
              <s-heading>Orders</s-heading>
              <s-text type="strong">145</s-text>
            </s-box>
          </s-grid-item>
        </s-grid>
      </s-stack>
    </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <s-page heading="Store analytics" inline-size="large">
    <s-section>
      <s-stack gap="base">
        <s-text>Monitor your store performance across all channels.</s-text>
        <s-grid>
          <s-grid-item>
            <s-box
              padding="base"
              background="base"
              borderWidth="base"
              borderColor="base"
              borderRadius="base"
            >
              <s-heading>Sales</s-heading>
              <s-text type="strong">$12,456</s-text>
            </s-box>
          </s-grid-item>
          <s-grid-item>
            <s-box
              padding="base"
              background="base"
              borderWidth="base"
              borderColor="base"
              borderRadius="base"
            >
              <s-heading>Orders</s-heading>
              <s-text type="strong">145</s-text>
            </s-box>
          </s-grid-item>
        </s-grid>
      </s-stack>
    </s-section>
  </s-page>
  ```

* #### Page with breadcrumbs and title

  ##### Description

  Shows a page with breadcrumb navigation and a descriptive heading, helping users understand their location in the navigation hierarchy.

  ##### jsx

  ```jsx
  <s-page heading="Edit Product" inlineSize="base">
    <s-link slot="breadcrumb-actions" href="/products">Products</s-link>
    <s-link slot="breadcrumb-actions" href="/products/123">Acme Widget</s-link>
    <s-section>
      <s-text>Update your product information and settings.</s-text>
    </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <s-page heading="Edit Product" inline-size="base">
    <s-link slot="breadcrumb-actions" href="/products">Products</s-link>
    <s-link slot="breadcrumb-actions" href="/products/123">Acme Widget</s-link>
    <s-section>
      <s-text>Update your product information and settings.</s-text>
    </s-section>
  </s-page>
  ```

* #### Page with primary and secondary actions

  ##### Description

  Demonstrates a page with a primary action button and secondary action buttons, showing how to provide main and related actions alongside the page heading.

  ##### jsx

  ```jsx
  <s-page heading="Products" inlineSize="base">
    <s-button slot="secondary-actions">Preview</s-button>
    <s-button slot="secondary-actions">Duplicate</s-button>
    <s-button slot="primary-action" variant="primary">Save</s-button>
    <s-section>
      <s-text>Manage your products and organize your catalog.</s-text>
    </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <s-page heading="Products" inline-size="base">
    <s-button slot="secondary-actions">Preview</s-button>
    <s-button slot="secondary-actions">Duplicate</s-button>
    <s-button slot="primary-action" variant="primary">Save</s-button>
    <s-section>
      <s-text>Manage your products and organize your catalog.</s-text>
    </s-section>
  </s-page>
  ```

## Best practices

* Always provide a title that describes the current page
* Include breadcrumbs when the page is part of a flow
* Include page actions in the header only if they are relevant to the entire page
* Include no more than one primary action and 3 secondary actions per page
* Don't include any actions at the bottom of the page

## Content guidelines

* Use sentence case and avoid unnecessary words
* Don't include punctuation like periods or exclamation marks
* Page titles should clearly communicate the page purpose
* Page actions should use a verb or verb + noun phrase (e.g., "Create store", "Edit product")

---
title: Page
description: ' Use `s-page` as the main container for placing content in your app. Page comes with preset layouts and automatically adds spacing between elements.'
api_name: app-home
source_url:
  html: 'https://shopify.dev/docs/api/app-home/polaris-web-components/structure/page'
  md: >-
    https://shopify.dev/docs/api/app-home/polaris-web-components/structure/page.md
---

# Page

Use `s-page` as the main container for placing content in your app. Page comes with preset layouts and automatically adds spacing between elements.

## Properties

Use as the outer wrapper of a page

* heading

  string

  The main page heading

* inlineSize

  "small" | "base" | "large"

  Default: 'base'

  The inline size of the page

  * `base` corresponds to a set default inline size
  * `large` full width with whitespace

## Slots

* aside

  HTMLElement

  The content to display in the aside section of the page.

  This slot is only rendered when `inlineSize` is "base".

* breadcrumb-actions

  HTMLElement

  Navigations back actions for the page.

  Only accepts `Link` components.

* children

  HTMLElement

  The content of the Page.

* primary-action

  HTMLElement

  The primary action for the page.

  Only accepts a single `Button` component with a `variant` of `primary`.

* secondary-actions

  HTMLElement

  Secondary actions for the page.

  Only accepts `ButtonGroup` and `Button` components with a `variant` of `secondary` or `auto`.

Examples

### Examples

* ####

  ##### jsx

  ```jsx
  <s-page heading="Products">
    <s-section>
      <s-text>Hello World</s-text>
    </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <s-page heading="Products">
    <s-section>
      <s-text>Hello World</s-text>
    </s-section>
  </s-page>
  ```

* #### Page with heading

  ##### Description

  Shows a page with a clear heading and descriptive text, illustrating how to use the page component with a title.

  ##### jsx

  ```jsx
  <s-page heading="Product catalog" inlineSize="base">
    <s-section>
      <s-text>Manage your product catalog and inventory.</s-text>
    </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <s-page heading="Product catalog" inline-size="base">
    <s-section>
      <s-text>Manage your product catalog and inventory.</s-text>
    </s-section>
  </s-page>
  ```

* #### Small inline size for focused content

  ##### Description

  Illustrates a page with a small inline size, ideal for focused, compact content like settings or forms with minimal information.

  ##### jsx

  ```jsx
  <s-page heading="Store settings" inlineSize="small">
    <s-section>
      <s-stack gap="base">
        <s-text>Configure your basic store preferences.</s-text>
        <s-text-field label="Store name" />
        <s-button variant="primary">Save</s-button>
      </s-stack>
    </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <s-page heading="Store settings" inline-size="small">
    <s-section>
      <s-stack gap="base">
        <s-text>Configure your basic store preferences.</s-text>
        <s-text-field label="Store name"></s-text-field>
        <s-button variant="primary">Save</s-button>
      </s-stack>
    </s-section>
  </s-page>
  ```

* #### Large inline size for wide content

  ##### Description

  Demonstrates a page with a large inline size, perfect for displaying broader content like analytics or dashboards with multiple information sections.

  ##### jsx

  ```jsx
  <s-page heading="Store analytics" inlineSize="large">
    <s-section>
      <s-stack gap="base">
        <s-text>Monitor your store performance across all channels.</s-text>
        <s-grid>
          <s-grid-item>
            <s-box
              padding="base"
              background="base"
              borderWidth="base"
              borderColor="base"
              borderRadius="base"
            >
              <s-heading>Sales</s-heading>
              <s-text type="strong">$12,456</s-text>
            </s-box>
          </s-grid-item>
          <s-grid-item>
            <s-box
              padding="base"
              background="base"
              borderWidth="base"
              borderColor="base"
              borderRadius="base"
            >
              <s-heading>Orders</s-heading>
              <s-text type="strong">145</s-text>
            </s-box>
          </s-grid-item>
        </s-grid>
      </s-stack>
    </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <s-page heading="Store analytics" inline-size="large">
    <s-section>
      <s-stack gap="base">
        <s-text>Monitor your store performance across all channels.</s-text>
        <s-grid>
          <s-grid-item>
            <s-box
              padding="base"
              background="base"
              borderWidth="base"
              borderColor="base"
              borderRadius="base"
            >
              <s-heading>Sales</s-heading>
              <s-text type="strong">$12,456</s-text>
            </s-box>
          </s-grid-item>
          <s-grid-item>
            <s-box
              padding="base"
              background="base"
              borderWidth="base"
              borderColor="base"
              borderRadius="base"
            >
              <s-heading>Orders</s-heading>
              <s-text type="strong">145</s-text>
            </s-box>
          </s-grid-item>
        </s-grid>
      </s-stack>
    </s-section>
  </s-page>
  ```

* #### Page with breadcrumbs and title

  ##### Description

  Shows a page with breadcrumb navigation and a descriptive heading, helping users understand their location in the navigation hierarchy.

  ##### jsx

  ```jsx
  <s-page heading="Edit Product" inlineSize="base">
    <s-link slot="breadcrumb-actions" href="/products">Products</s-link>
    <s-link slot="breadcrumb-actions" href="/products/123">Acme Widget</s-link>
    <s-section>
      <s-text>Update your product information and settings.</s-text>
    </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <s-page heading="Edit Product" inline-size="base">
    <s-link slot="breadcrumb-actions" href="/products">Products</s-link>
    <s-link slot="breadcrumb-actions" href="/products/123">Acme Widget</s-link>
    <s-section>
      <s-text>Update your product information and settings.</s-text>
    </s-section>
  </s-page>
  ```

* #### Page with primary and secondary actions

  ##### Description

  Demonstrates a page with a primary action button and secondary action buttons, showing how to provide main and related actions alongside the page heading.

  ##### jsx

  ```jsx
  <s-page heading="Products" inlineSize="base">
    <s-button slot="secondary-actions">Preview</s-button>
    <s-button slot="secondary-actions">Duplicate</s-button>
    <s-button slot="primary-action" variant="primary">Save</s-button>
    <s-section>
      <s-text>Manage your products and organize your catalog.</s-text>
    </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <s-page heading="Products" inline-size="base">
    <s-button slot="secondary-actions">Preview</s-button>
    <s-button slot="secondary-actions">Duplicate</s-button>
    <s-button slot="primary-action" variant="primary">Save</s-button>
    <s-section>
      <s-text>Manage your products and organize your catalog.</s-text>
    </s-section>
  </s-page>
  ```

## Best practices

* Always provide a title that describes the current page
* Include breadcrumbs when the page is part of a flow
* Include page actions in the header only if they are relevant to the entire page
* Include no more than one primary action and 3 secondary actions per page
* Don't include any actions at the bottom of the page

## Content guidelines

* Use sentence case and avoid unnecessary words
* Don't include punctuation like periods or exclamation marks
* Page titles should clearly communicate the page purpose
* Page actions should use a verb or verb + noun phrase (e.g., "Create store", "Edit product")

---
title: Page
description: ' Use `s-page` as the main container for placing content in your app. Page comes with preset layouts and automatically adds spacing between elements.'
api_name: app-home
source_url:
  html: 'https://shopify.dev/docs/api/app-home/polaris-web-components/structure/page'
  md: >-
    https://shopify.dev/docs/api/app-home/polaris-web-components/structure/page.md
---

# Page

Use `s-page` as the main container for placing content in your app. Page comes with preset layouts and automatically adds spacing between elements.

## Properties

Use as the outer wrapper of a page

* heading

  string

  The main page heading

* inlineSize

  "small" | "base" | "large"

  Default: 'base'

  The inline size of the page

  * `base` corresponds to a set default inline size
  * `large` full width with whitespace

## Slots

* aside

  HTMLElement

  The content to display in the aside section of the page.

  This slot is only rendered when `inlineSize` is "base".

* breadcrumb-actions

  HTMLElement

  Navigations back actions for the page.

  Only accepts `Link` components.

* children

  HTMLElement

  The content of the Page.

* primary-action

  HTMLElement

  The primary action for the page.

  Only accepts a single `Button` component with a `variant` of `primary`.

* secondary-actions

  HTMLElement

  Secondary actions for the page.

  Only accepts `ButtonGroup` and `Button` components with a `variant` of `secondary` or `auto`.

Examples

### Examples

* ####

  ##### jsx

  ```jsx
  <s-page heading="Products">
    <s-section>
      <s-text>Hello World</s-text>
    </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <s-page heading="Products">
    <s-section>
      <s-text>Hello World</s-text>
    </s-section>
  </s-page>
  ```

* #### Page with heading

  ##### Description

  Shows a page with a clear heading and descriptive text, illustrating how to use the page component with a title.

  ##### jsx

  ```jsx
  <s-page heading="Product catalog" inlineSize="base">
    <s-section>
      <s-text>Manage your product catalog and inventory.</s-text>
    </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <s-page heading="Product catalog" inline-size="base">
    <s-section>
      <s-text>Manage your product catalog and inventory.</s-text>
    </s-section>
  </s-page>
  ```

* #### Small inline size for focused content

  ##### Description

  Illustrates a page with a small inline size, ideal for focused, compact content like settings or forms with minimal information.

  ##### jsx

  ```jsx
  <s-page heading="Store settings" inlineSize="small">
    <s-section>
      <s-stack gap="base">
        <s-text>Configure your basic store preferences.</s-text>
        <s-text-field label="Store name" />
        <s-button variant="primary">Save</s-button>
      </s-stack>
    </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <s-page heading="Store settings" inline-size="small">
    <s-section>
      <s-stack gap="base">
        <s-text>Configure your basic store preferences.</s-text>
        <s-text-field label="Store name"></s-text-field>
        <s-button variant="primary">Save</s-button>
      </s-stack>
    </s-section>
  </s-page>
  ```

* #### Large inline size for wide content

  ##### Description

  Demonstrates a page with a large inline size, perfect for displaying broader content like analytics or dashboards with multiple information sections.

  ##### jsx

  ```jsx
  <s-page heading="Store analytics" inlineSize="large">
    <s-section>
      <s-stack gap="base">
        <s-text>Monitor your store performance across all channels.</s-text>
        <s-grid>
          <s-grid-item>
            <s-box
              padding="base"
              background="base"
              borderWidth="base"
              borderColor="base"
              borderRadius="base"
            >
              <s-heading>Sales</s-heading>
              <s-text type="strong">$12,456</s-text>
            </s-box>
          </s-grid-item>
          <s-grid-item>
            <s-box
              padding="base"
              background="base"
              borderWidth="base"
              borderColor="base"
              borderRadius="base"
            >
              <s-heading>Orders</s-heading>
              <s-text type="strong">145</s-text>
            </s-box>
          </s-grid-item>
        </s-grid>
      </s-stack>
    </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <s-page heading="Store analytics" inline-size="large">
    <s-section>
      <s-stack gap="base">
        <s-text>Monitor your store performance across all channels.</s-text>
        <s-grid>
          <s-grid-item>
            <s-box
              padding="base"
              background="base"
              borderWidth="base"
              borderColor="base"
              borderRadius="base"
            >
              <s-heading>Sales</s-heading>
              <s-text type="strong">$12,456</s-text>
            </s-box>
          </s-grid-item>
          <s-grid-item>
            <s-box
              padding="base"
              background="base"
              borderWidth="base"
              borderColor="base"
              borderRadius="base"
            >
              <s-heading>Orders</s-heading>
              <s-text type="strong">145</s-text>
            </s-box>
          </s-grid-item>
        </s-grid>
      </s-stack>
    </s-section>
  </s-page>
  ```

* #### Page with breadcrumbs and title

  ##### Description

  Shows a page with breadcrumb navigation and a descriptive heading, helping users understand their location in the navigation hierarchy.

  ##### jsx

  ```jsx
  <s-page heading="Edit Product" inlineSize="base">
    <s-link slot="breadcrumb-actions" href="/products">Products</s-link>
    <s-link slot="breadcrumb-actions" href="/products/123">Acme Widget</s-link>
    <s-section>
      <s-text>Update your product information and settings.</s-text>
    </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <s-page heading="Edit Product" inline-size="base">
    <s-link slot="breadcrumb-actions" href="/products">Products</s-link>
    <s-link slot="breadcrumb-actions" href="/products/123">Acme Widget</s-link>
    <s-section>
      <s-text>Update your product information and settings.</s-text>
    </s-section>
  </s-page>
  ```

* #### Page with primary and secondary actions

  ##### Description

  Demonstrates a page with a primary action button and secondary action buttons, showing how to provide main and related actions alongside the page heading.

  ##### jsx

  ```jsx
  <s-page heading="Products" inlineSize="base">
    <s-button slot="secondary-actions">Preview</s-button>
    <s-button slot="secondary-actions">Duplicate</s-button>
    <s-button slot="primary-action" variant="primary">Save</s-button>
    <s-section>
      <s-text>Manage your products and organize your catalog.</s-text>
    </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <s-page heading="Products" inline-size="base">
    <s-button slot="secondary-actions">Preview</s-button>
    <s-button slot="secondary-actions">Duplicate</s-button>
    <s-button slot="primary-action" variant="primary">Save</s-button>
    <s-section>
      <s-text>Manage your products and organize your catalog.</s-text>
    </s-section>
  </s-page>
  ```

## Best practices

* Always provide a title that describes the current page
* Include breadcrumbs when the page is part of a flow
* Include page actions in the header only if they are relevant to the entire page
* Include no more than one primary action and 3 secondary actions per page
* Don't include any actions at the bottom of the page

## Content guidelines

* Use sentence case and avoid unnecessary words
* Don't include punctuation like periods or exclamation marks
* Page titles should clearly communicate the page purpose
* Page actions should use a verb or verb + noun phrase (e.g., "Create store", "Edit product")

---
title: Page
description: ' Use `s-page` as the main container for placing content in your app. Page comes with preset layouts and automatically adds spacing between elements.'
api_name: app-home
source_url:
  html: 'https://shopify.dev/docs/api/app-home/polaris-web-components/structure/page'
  md: >-
    https://shopify.dev/docs/api/app-home/polaris-web-components/structure/page.md
---

# Page

Use `s-page` as the main container for placing content in your app. Page comes with preset layouts and automatically adds spacing between elements.

## Properties

Use as the outer wrapper of a page

* heading

  string

  The main page heading

* inlineSize

  "small" | "base" | "large"

  Default: 'base'

  The inline size of the page

  * `base` corresponds to a set default inline size
  * `large` full width with whitespace

## Slots

* aside

  HTMLElement

  The content to display in the aside section of the page.

  This slot is only rendered when `inlineSize` is "base".

* breadcrumb-actions

  HTMLElement

  Navigations back actions for the page.

  Only accepts `Link` components.

* children

  HTMLElement

  The content of the Page.

* primary-action

  HTMLElement

  The primary action for the page.

  Only accepts a single `Button` component with a `variant` of `primary`.

* secondary-actions

  HTMLElement

  Secondary actions for the page.

  Only accepts `ButtonGroup` and `Button` components with a `variant` of `secondary` or `auto`.

Examples

### Examples

* ####

  ##### jsx

  ```jsx
  <s-page heading="Products">
    <s-section>
      <s-text>Hello World</s-text>
    </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <s-page heading="Products">
    <s-section>
      <s-text>Hello World</s-text>
    </s-section>
  </s-page>
  ```

* #### Page with heading

  ##### Description

  Shows a page with a clear heading and descriptive text, illustrating how to use the page component with a title.

  ##### jsx

  ```jsx
  <s-page heading="Product catalog" inlineSize="base">
    <s-section>
      <s-text>Manage your product catalog and inventory.</s-text>
    </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <s-page heading="Product catalog" inline-size="base">
    <s-section>
      <s-text>Manage your product catalog and inventory.</s-text>
    </s-section>
  </s-page>
  ```

* #### Small inline size for focused content

  ##### Description

  Illustrates a page with a small inline size, ideal for focused, compact content like settings or forms with minimal information.

  ##### jsx

  ```jsx
  <s-page heading="Store settings" inlineSize="small">
    <s-section>
      <s-stack gap="base">
        <s-text>Configure your basic store preferences.</s-text>
        <s-text-field label="Store name" />
        <s-button variant="primary">Save</s-button>
      </s-stack>
    </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <s-page heading="Store settings" inline-size="small">
    <s-section>
      <s-stack gap="base">
        <s-text>Configure your basic store preferences.</s-text>
        <s-text-field label="Store name"></s-text-field>
        <s-button variant="primary">Save</s-button>
      </s-stack>
    </s-section>
  </s-page>
  ```

* #### Large inline size for wide content

  ##### Description

  Demonstrates a page with a large inline size, perfect for displaying broader content like analytics or dashboards with multiple information sections.

  ##### jsx

  ```jsx
  <s-page heading="Store analytics" inlineSize="large">
    <s-section>
      <s-stack gap="base">
        <s-text>Monitor your store performance across all channels.</s-text>
        <s-grid>
          <s-grid-item>
            <s-box
              padding="base"
              background="base"
              borderWidth="base"
              borderColor="base"
              borderRadius="base"
            >
              <s-heading>Sales</s-heading>
              <s-text type="strong">$12,456</s-text>
            </s-box>
          </s-grid-item>
          <s-grid-item>
            <s-box
              padding="base"
              background="base"
              borderWidth="base"
              borderColor="base"
              borderRadius="base"
            >
              <s-heading>Orders</s-heading>
              <s-text type="strong">145</s-text>
            </s-box>
          </s-grid-item>
        </s-grid>
      </s-stack>
    </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <s-page heading="Store analytics" inline-size="large">
    <s-section>
      <s-stack gap="base">
        <s-text>Monitor your store performance across all channels.</s-text>
        <s-grid>
          <s-grid-item>
            <s-box
              padding="base"
              background="base"
              borderWidth="base"
              borderColor="base"
              borderRadius="base"
            >
              <s-heading>Sales</s-heading>
              <s-text type="strong">$12,456</s-text>
            </s-box>
          </s-grid-item>
          <s-grid-item>
            <s-box
              padding="base"
              background="base"
              borderWidth="base"
              borderColor="base"
              borderRadius="base"
            >
              <s-heading>Orders</s-heading>
              <s-text type="strong">145</s-text>
            </s-box>
          </s-grid-item>
        </s-grid>
      </s-stack>
    </s-section>
  </s-page>
  ```

* #### Page with breadcrumbs and title

  ##### Description

  Shows a page with breadcrumb navigation and a descriptive heading, helping users understand their location in the navigation hierarchy.

  ##### jsx

  ```jsx
  <s-page heading="Edit Product" inlineSize="base">
    <s-link slot="breadcrumb-actions" href="/products">Products</s-link>
    <s-link slot="breadcrumb-actions" href="/products/123">Acme Widget</s-link>
    <s-section>
      <s-text>Update your product information and settings.</s-text>
    </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <s-page heading="Edit Product" inline-size="base">
    <s-link slot="breadcrumb-actions" href="/products">Products</s-link>
    <s-link slot="breadcrumb-actions" href="/products/123">Acme Widget</s-link>
    <s-section>
      <s-text>Update your product information and settings.</s-text>
    </s-section>
  </s-page>
  ```

* #### Page with primary and secondary actions

  ##### Description

  Demonstrates a page with a primary action button and secondary action buttons, showing how to provide main and related actions alongside the page heading.

  ##### jsx

  ```jsx
  <s-page heading="Products" inlineSize="base">
    <s-button slot="secondary-actions">Preview</s-button>
    <s-button slot="secondary-actions">Duplicate</s-button>
    <s-button slot="primary-action" variant="primary">Save</s-button>
    <s-section>
      <s-text>Manage your products and organize your catalog.</s-text>
    </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <s-page heading="Products" inline-size="base">
    <s-button slot="secondary-actions">Preview</s-button>
    <s-button slot="secondary-actions">Duplicate</s-button>
    <s-button slot="primary-action" variant="primary">Save</s-button>
    <s-section>
      <s-text>Manage your products and organize your catalog.</s-text>
    </s-section>
  </s-page>
  ```

## Best practices

* Always provide a title that describes the current page
* Include breadcrumbs when the page is part of a flow
* Include page actions in the header only if they are relevant to the entire page
* Include no more than one primary action and 3 secondary actions per page
* Don't include any actions at the bottom of the page

## Content guidelines

* Use sentence case and avoid unnecessary words
* Don't include punctuation like periods or exclamation marks
* Page titles should clearly communicate the page purpose
* Page actions should use a verb or verb + noun phrase (e.g., "Create store", "Edit product")

---
title: Page
description: ' Use `s-page` as the main container for placing content in your app. Page comes with preset layouts and automatically adds spacing between elements.'
api_name: app-home
source_url:
  html: 'https://shopify.dev/docs/api/app-home/polaris-web-components/structure/page'
  md: >-
    https://shopify.dev/docs/api/app-home/polaris-web-components/structure/page.md
---

# Page

Use `s-page` as the main container for placing content in your app. Page comes with preset layouts and automatically adds spacing between elements.

## Properties

Use as the outer wrapper of a page

* heading

  string

  The main page heading

* inlineSize

  "small" | "base" | "large"

  Default: 'base'

  The inline size of the page

  * `base` corresponds to a set default inline size
  * `large` full width with whitespace

## Slots

* aside

  HTMLElement

  The content to display in the aside section of the page.

  This slot is only rendered when `inlineSize` is "base".

* breadcrumb-actions

  HTMLElement

  Navigations back actions for the page.

  Only accepts `Link` components.

* children

  HTMLElement

  The content of the Page.

* primary-action

  HTMLElement

  The primary action for the page.

  Only accepts a single `Button` component with a `variant` of `primary`.

* secondary-actions

  HTMLElement

  Secondary actions for the page.

  Only accepts `ButtonGroup` and `Button` components with a `variant` of `secondary` or `auto`.

Examples

### Examples

* ####

  ##### jsx

  ```jsx
  <s-page heading="Products">
    <s-section>
      <s-text>Hello World</s-text>
    </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <s-page heading="Products">
    <s-section>
      <s-text>Hello World</s-text>
    </s-section>
  </s-page>
  ```

* #### Page with heading

  ##### Description

  Shows a page with a clear heading and descriptive text, illustrating how to use the page component with a title.

  ##### jsx

  ```jsx
  <s-page heading="Product catalog" inlineSize="base">
    <s-section>
      <s-text>Manage your product catalog and inventory.</s-text>
    </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <s-page heading="Product catalog" inline-size="base">
    <s-section>
      <s-text>Manage your product catalog and inventory.</s-text>
    </s-section>
  </s-page>
  ```

* #### Small inline size for focused content

  ##### Description

  Illustrates a page with a small inline size, ideal for focused, compact content like settings or forms with minimal information.

  ##### jsx

  ```jsx
  <s-page heading="Store settings" inlineSize="small">
    <s-section>
      <s-stack gap="base">
        <s-text>Configure your basic store preferences.</s-text>
        <s-text-field label="Store name" />
        <s-button variant="primary">Save</s-button>
      </s-stack>
    </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <s-page heading="Store settings" inline-size="small">
    <s-section>
      <s-stack gap="base">
        <s-text>Configure your basic store preferences.</s-text>
        <s-text-field label="Store name"></s-text-field>
        <s-button variant="primary">Save</s-button>
      </s-stack>
    </s-section>
  </s-page>
  ```

* #### Large inline size for wide content

  ##### Description

  Demonstrates a page with a large inline size, perfect for displaying broader content like analytics or dashboards with multiple information sections.

  ##### jsx

  ```jsx
  <s-page heading="Store analytics" inlineSize="large">
    <s-section>
      <s-stack gap="base">
        <s-text>Monitor your store performance across all channels.</s-text>
        <s-grid>
          <s-grid-item>
            <s-box
              padding="base"
              background="base"
              borderWidth="base"
              borderColor="base"
              borderRadius="base"
            >
              <s-heading>Sales</s-heading>
              <s-text type="strong">$12,456</s-text>
            </s-box>
          </s-grid-item>
          <s-grid-item>
            <s-box
              padding="base"
              background="base"
              borderWidth="base"
              borderColor="base"
              borderRadius="base"
            >
              <s-heading>Orders</s-heading>
              <s-text type="strong">145</s-text>
            </s-box>
          </s-grid-item>
        </s-grid>
      </s-stack>
    </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <s-page heading="Store analytics" inline-size="large">
    <s-section>
      <s-stack gap="base">
        <s-text>Monitor your store performance across all channels.</s-text>
        <s-grid>
          <s-grid-item>
            <s-box
              padding="base"
              background="base"
              borderWidth="base"
              borderColor="base"
              borderRadius="base"
            >
              <s-heading>Sales</s-heading>
              <s-text type="strong">$12,456</s-text>
            </s-box>
          </s-grid-item>
          <s-grid-item>
            <s-box
              padding="base"
              background="base"
              borderWidth="base"
              borderColor="base"
              borderRadius="base"
            >
              <s-heading>Orders</s-heading>
              <s-text type="strong">145</s-text>
            </s-box>
          </s-grid-item>
        </s-grid>
      </s-stack>
    </s-section>
  </s-page>
  ```

* #### Page with breadcrumbs and title

  ##### Description

  Shows a page with breadcrumb navigation and a descriptive heading, helping users understand their location in the navigation hierarchy.

  ##### jsx

  ```jsx
  <s-page heading="Edit Product" inlineSize="base">
    <s-link slot="breadcrumb-actions" href="/products">Products</s-link>
    <s-link slot="breadcrumb-actions" href="/products/123">Acme Widget</s-link>
    <s-section>
      <s-text>Update your product information and settings.</s-text>
    </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <s-page heading="Edit Product" inline-size="base">
    <s-link slot="breadcrumb-actions" href="/products">Products</s-link>
    <s-link slot="breadcrumb-actions" href="/products/123">Acme Widget</s-link>
    <s-section>
      <s-text>Update your product information and settings.</s-text>
    </s-section>
  </s-page>
  ```

* #### Page with primary and secondary actions

  ##### Description

  Demonstrates a page with a primary action button and secondary action buttons, showing how to provide main and related actions alongside the page heading.

  ##### jsx

  ```jsx
  <s-page heading="Products" inlineSize="base">
    <s-button slot="secondary-actions">Preview</s-button>
    <s-button slot="secondary-actions">Duplicate</s-button>
    <s-button slot="primary-action" variant="primary">Save</s-button>
    <s-section>
      <s-text>Manage your products and organize your catalog.</s-text>
    </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <s-page heading="Products" inline-size="base">
    <s-button slot="secondary-actions">Preview</s-button>
    <s-button slot="secondary-actions">Duplicate</s-button>
    <s-button slot="primary-action" variant="primary">Save</s-button>
    <s-section>
      <s-text>Manage your products and organize your catalog.</s-text>
    </s-section>
  </s-page>
  ```

## Best practices

* Always provide a title that describes the current page
* Include breadcrumbs when the page is part of a flow
* Include page actions in the header only if they are relevant to the entire page
* Include no more than one primary action and 3 secondary actions per page
* Don't include any actions at the bottom of the page

## Content guidelines

* Use sentence case and avoid unnecessary words
* Don't include punctuation like periods or exclamation marks
* Page titles should clearly communicate the page purpose
* Page actions should use a verb or verb + noun phrase (e.g., "Create store", "Edit product")

---
title: Table
description: >-
  Display data clearly in rows and columns, helping users view, analyze, and
  compare information. Automatically renders as a list on small screens and a
  table on large ones.
api_name: app-home
source_url:
  html: 'https://shopify.dev/docs/api/app-home/polaris-web-components/structure/table'
  md: >-
    https://shopify.dev/docs/api/app-home/polaris-web-components/structure/table.md
---

# Table

Display data clearly in rows and columns, helping users view, analyze, and compare information. Automatically renders as a list on small screens and a table on large ones.

## Properties

* hasNextPage

  boolean

  Default: false

  Whether there's an additional page of data.

* hasPreviousPage

  boolean

  Default: false

  Whether there's a previous page of data.

* loading

  boolean

  Default: false

  Whether the table is in a loading state, such as initial page load or loading the next page in a paginated table. When true, the table could be in an inert state, which prevents user interaction.

* paginate

  boolean

  Default: false

  Whether to use pagination controls.

* variant

  "auto" | "list"

  Default: 'auto'

  Sets the layout of the Table.

  * `list`: The Table is always displayed as a list.
  * `table`: The Table is always displayed as a table.
  * `auto`: The Table is displayed as a table on wide devices and as a list on narrow devices.

## Slots

* children

  HTMLElement

  The content of the Table.

* filters

  HTMLElement

  Additional filters to display in the table. For example, the `s-search-field` component can be used to filter the table data.

## Events

Learn more about [registering events](https://shopify.dev/docs/api/app-home/using-polaris-components#event-handling).

* nextpage

  CallbackEventListener\<typeof tagName> | null

* previouspage

  CallbackEventListener\<typeof tagName> | null

### CallbackEventListener

```ts
(EventListener & {
      (event: CallbackEvent<T>): void;
    }) | null
```

### CallbackEvent

```ts
Event & {
  currentTarget: HTMLElementTagNameMap[T];
}
```

## TableBody

Define the main content area of a table, containing rows and cells that display data.

## Slots

* children

  HTMLElement

  The body of the table. May not have any semantic meaning in the Table's `list` variant.

## TableCell

Display data within a cell in a table row.

## Slots

* children

  HTMLElement

  The content of the table cell.

## TableHeader

Display column names at the top of a table.

* format

  HeaderFormat

  The format of the column. Will automatically apply styling and alignment to cell content based on the value.

  * `base`: The base format for columns.
  * `currency`: Formats the column as currency.
  * `numeric`: Formats the column as a number.

* listSlot

  ListSlotType

  Default: 'labeled'

  Content designation for the table's `list` variant.

  * `primary`: The most important content. Only one column can have this designation.
  * `secondary`: The secondary content. Only one column can have this designation.
  * `kicker`: Content that is displayed before primary and secondary content, but with less visual prominence. Only one column can have this designation.
  * `inline`: Content that is displayed inline.
  * `labeled`: Each column with this designation displays as a heading-content pair.

### HeaderFormat

```ts
'base' | 'numeric' | 'currency'
```

### ListSlotType

```ts
'primary' | 'secondary' | 'kicker' | 'inline' | 'labeled'
```

## Slots

* children

  HTMLElement

  The heading of the column in the `table` variant, and the label of its data in `list` variant.

## TableHeaderRow

Define a header row in a table, displaying column names and enabling sorting.

## Slots

* children

  HTMLElement

  Contents of the table heading row; children should be `TableHeading` components.

## TableRow

Display a row of data within the body of a table.

* clickDelegate

  string

  The ID of an interactive element (e.g. `s-link`) in the row that will be the target of the click when the row is clicked. This is the primary action for the row; it should not be used for secondary actions.

  This is a click-only affordance, and does not introduce any keyboard or screen reader affordances. Which is why the target element must be in the table; so that keyboard and screen reader users can interact with it normally.

## Slots

* children

  HTMLElement

  The content of a TableRow, which should be `TableCell` components.

Examples

### Examples

* #### Code

  ##### jsx

  ```jsx
  <s-section padding="none">
    <s-table>
      <s-table-header-row>
        <s-table-header>Name</s-table-header>
        <s-table-header>Email</s-table-header>
        <s-table-header format="numeric">Orders placed</s-table-header>
        <s-table-header>Phone</s-table-header>
      </s-table-header-row>
      <s-table-body>
        <s-table-row>
          <s-table-cell>John Smith</s-table-cell>
          <s-table-cell>john@example.com</s-table-cell>
          <s-table-cell>23</s-table-cell>
          <s-table-cell>123-456-7890</s-table-cell>
        </s-table-row>
        <s-table-row>
          <s-table-cell>Jane Johnson</s-table-cell>
          <s-table-cell>jane@example.com</s-table-cell>
          <s-table-cell>15</s-table-cell>
          <s-table-cell>234-567-8901</s-table-cell>
        </s-table-row>
        <s-table-row>
          <s-table-cell>Brandon Williams</s-table-cell>
          <s-table-cell>brandon@example.com</s-table-cell>
          <s-table-cell>42</s-table-cell>
          <s-table-cell>345-678-9012</s-table-cell>
        </s-table-row>
      </s-table-body>
    </s-table>
  </s-section>
  ```

  ##### html

  ```html
  <s-section padding="none">
    <s-table>
      <s-table-header-row>
        <s-table-header>Name</s-table-header>
        <s-table-header>Email</s-table-header>
        <s-table-header format="numeric">Orders placed</s-table-header>
        <s-table-header>Phone</s-table-header>
      </s-table-header-row>
      <s-table-body>
        <s-table-row>
          <s-table-cell>John Smith</s-table-cell>
          <s-table-cell>john@example.com</s-table-cell>
          <s-table-cell>23</s-table-cell>
          <s-table-cell>123-456-7890</s-table-cell>
        </s-table-row>
        <s-table-row>
          <s-table-cell>Jane Johnson</s-table-cell>
          <s-table-cell>jane@example.com</s-table-cell>
          <s-table-cell>15</s-table-cell>
          <s-table-cell>234-567-8901</s-table-cell>
        </s-table-row>
        <s-table-row>
          <s-table-cell>Brandon Williams</s-table-cell>
          <s-table-cell>brandon@example.com</s-table-cell>
          <s-table-cell>42</s-table-cell>
          <s-table-cell>345-678-9012</s-table-cell>
        </s-table-row>
      </s-table-body>
    </s-table>
  </s-section>
  ```

* #### Basic Usage

  ##### Description

  Tables expand to full width by default.

  ##### jsx

  ```jsx
  <s-section padding="none">
    <s-table>
      <s-table-header-row>
        <s-table-header listSlot="primary">Product</s-table-header>
        <s-table-header listSlot="inline">Status</s-table-header>
        <s-table-header listSlot="labeled">Inventory</s-table-header>
        <s-table-header listSlot="labeled">Price</s-table-header>
      </s-table-header-row>

      <s-table-body>
        <s-table-row>
          <s-table-cell>Water bottle</s-table-cell>
          <s-table-cell>
            <s-badge tone="success">Active</s-badge>
          </s-table-cell>
          <s-table-cell>128</s-table-cell>
          <s-table-cell>$24.99</s-table-cell>
        </s-table-row>
        <s-table-row>
          <s-table-cell>T-shirt</s-table-cell>
          <s-table-cell>
            <s-badge tone="warning">Low stock</s-badge>
          </s-table-cell>
          <s-table-cell>15</s-table-cell>
          <s-table-cell>$19.99</s-table-cell>
        </s-table-row>
        <s-table-row>
          <s-table-cell>Cutting board</s-table-cell>
          <s-table-cell>
            <s-badge tone="critical">Out of stock</s-badge>
          </s-table-cell>
          <s-table-cell>0</s-table-cell>
          <s-table-cell>$34.99</s-table-cell>
        </s-table-row>
      </s-table-body>
    </s-table>
  </s-section>
  ```

  ##### html

  ```html
  <s-section padding="none">
    <s-table>
      <s-table-header-row>
        <s-table-header listSlot="primary">Product</s-table-header>
        <s-table-header listSlot="inline">Status</s-table-header>
        <s-table-header listSlot="labeled">Inventory</s-table-header>
        <s-table-header listSlot="labeled">Price</s-table-header>
      </s-table-header-row>

      <s-table-body>
        <s-table-row>
          <s-table-cell>Water bottle</s-table-cell>
          <s-table-cell>
            <s-badge tone="success">Active</s-badge>
          </s-table-cell>
          <s-table-cell>128</s-table-cell>
          <s-table-cell>$24.99</s-table-cell>
        </s-table-row>
        <s-table-row>
          <s-table-cell>T-shirt</s-table-cell>
          <s-table-cell>
            <s-badge tone="warning">Low stock</s-badge>
          </s-table-cell>
          <s-table-cell>15</s-table-cell>
          <s-table-cell>$19.99</s-table-cell>
        </s-table-row>
        <s-table-row>
          <s-table-cell>Cutting board</s-table-cell>
          <s-table-cell>
            <s-badge tone="critical">Out of stock</s-badge>
          </s-table-cell>
          <s-table-cell>0</s-table-cell>
          <s-table-cell>$34.99</s-table-cell>
        </s-table-row>
      </s-table-body>
    </s-table>
  </s-section>
  ```

* #### With Pagination

  ##### Description

  Add pagination controls for navigating large datasets.

  ##### jsx

  ```jsx
  <s-section padding="none">
    <s-table paginate hasPreviousPage hasNextPage>
      <s-table-header-row>
        <s-table-header listSlot="primary">Product</s-table-header>
        <s-table-header listSlot="inline">Status</s-table-header>
        <s-table-header listSlot="secondary" format="numeric">Sales</s-table-header>
      </s-table-header-row>

      <s-table-body>
        <s-table-row>
          <s-table-cell>Product 1</s-table-cell>
          <s-table-cell>Active</s-table-cell>
          <s-table-cell>250</s-table-cell>
        </s-table-row>
        <s-table-row>
          <s-table-cell>Product 2</s-table-cell>
          <s-table-cell>Active</s-table-cell>
          <s-table-cell>180</s-table-cell>
        </s-table-row>
        <s-table-row>
          <s-table-cell>Product 3</s-table-cell>
          <s-table-cell>Paused</s-table-cell>
          <s-table-cell>95</s-table-cell>
        </s-table-row>
      </s-table-body>
    </s-table>
  </s-section>
  ```

  ##### html

  ```html
  <s-section padding="none">
    <s-table paginate hasPreviousPage hasNextPage>
      <s-table-header-row>
        <s-table-header listSlot="primary">Product</s-table-header>
        <s-table-header listSlot="inline">Status</s-table-header>
        <s-table-header listSlot="secondary" format="numeric">Sales</s-table-header>
      </s-table-header-row>

      <s-table-body>
        <s-table-row>
          <s-table-cell>Product 1</s-table-cell>
          <s-table-cell>Active</s-table-cell>
          <s-table-cell>250</s-table-cell>
        </s-table-row>
        <s-table-row>
          <s-table-cell>Product 2</s-table-cell>
          <s-table-cell>Active</s-table-cell>
          <s-table-cell>180</s-table-cell>
        </s-table-row>
        <s-table-row>
          <s-table-cell>Product 3</s-table-cell>
          <s-table-cell>Paused</s-table-cell>
          <s-table-cell>95</s-table-cell>
        </s-table-row>
      </s-table-body>
    </s-table>
  </s-section>
  ```

* #### With Loading State

  ##### Description

  Display a loading state while fetching data.

  ##### jsx

  ```jsx
  <s-section padding="none">
    <s-table loading>
      <s-table-header-row>
        <s-table-header listSlot="primary">Product</s-table-header>
        <s-table-header listSlot="inline">Status</s-table-header>
        <s-table-header listSlot="labeled">Inventory</s-table-header>
      </s-table-header-row>

      <s-table-body>
        <s-table-row>
          <s-table-cell>Water bottle</s-table-cell>
          <s-table-cell>
            <s-badge tone="success">Active</s-badge>
          </s-table-cell>
          <s-table-cell>128</s-table-cell>
        </s-table-row>
        <s-table-row>
          <s-table-cell>T-shirt</s-table-cell>
          <s-table-cell>
            <s-badge tone="warning">Low stock</s-badge>
          </s-table-cell>
          <s-table-cell>15</s-table-cell>
        </s-table-row>
        <s-table-row>
          <s-table-cell>Cutting board</s-table-cell>
          <s-table-cell>
            <s-badge tone="critical">Out of stock</s-badge>
          </s-table-cell>
          <s-table-cell>0</s-table-cell>
        </s-table-row>
        <s-table-row>
          <s-table-cell>Notebook set</s-table-cell>
          <s-table-cell>
            <s-badge tone="success">Active</s-badge>
          </s-table-cell>
          <s-table-cell>245</s-table-cell>
        </s-table-row>
      </s-table-body>
    </s-table>
  </s-section>
  ```

  ##### html

  ```html
  <s-section padding="none">
    <s-table loading>
      <s-table-header-row>
        <s-table-header listSlot="primary">Product</s-table-header>
        <s-table-header listSlot="inline">Status</s-table-header>
        <s-table-header listSlot="labeled">Inventory</s-table-header>
      </s-table-header-row>

      <s-table-body>
        <s-table-row>
          <s-table-cell>Water bottle</s-table-cell>
          <s-table-cell>
            <s-badge tone="success">Active</s-badge>
          </s-table-cell>
          <s-table-cell>128</s-table-cell>
        </s-table-row>
        <s-table-row>
          <s-table-cell>T-shirt</s-table-cell>
          <s-table-cell>
            <s-badge tone="warning">Low stock</s-badge>
          </s-table-cell>
          <s-table-cell>15</s-table-cell>
        </s-table-row>
        <s-table-row>
          <s-table-cell>Cutting board</s-table-cell>
          <s-table-cell>
            <s-badge tone="critical">Out of stock</s-badge>
          </s-table-cell>
          <s-table-cell>0</s-table-cell>
        </s-table-row>
        <s-table-row>
          <s-table-cell>Notebook set</s-table-cell>
          <s-table-cell>
            <s-badge tone="success">Active</s-badge>
          </s-table-cell>
          <s-table-cell>245</s-table-cell>
        </s-table-row>
      </s-table-body>
    </s-table>
  </s-section>
  ```

* #### Full-width table with multiple columns

  ##### Description

  Display multiple columns in a full-width table.

  ##### jsx

  ```jsx
  <s-section padding="none">
    <s-table>
      <s-table-header-row>
        <s-table-header listSlot="primary">Product</s-table-header>
        <s-table-header listSlot="kicker">SKU</s-table-header>
        <s-table-header listSlot="inline">Status</s-table-header>
        <s-table-header listSlot="labeled" format="numeric">Inventory</s-table-header>
        <s-table-header listSlot="labeled" format="currency">Price</s-table-header>
        <s-table-header listSlot="labeled">Last updated</s-table-header>
      </s-table-header-row>

      <s-table-body>
        <s-table-row>
          <s-table-cell>Water bottle</s-table-cell>
          <s-table-cell>WB-001</s-table-cell>
          <s-table-cell>
            <s-badge tone="success">Active</s-badge>
          </s-table-cell>
          <s-table-cell>128</s-table-cell>
          <s-table-cell>$24.99</s-table-cell>
          <s-table-cell>2 hours ago</s-table-cell>
        </s-table-row>
        <s-table-row>
          <s-table-cell>T-shirt</s-table-cell>
          <s-table-cell>TS-002</s-table-cell>
          <s-table-cell>
            <s-badge tone="warning">Low stock</s-badge>
          </s-table-cell>
          <s-table-cell>15</s-table-cell>
          <s-table-cell>$19.99</s-table-cell>
          <s-table-cell>1 day ago</s-table-cell>
        </s-table-row>
        <s-table-row>
          <s-table-cell>Cutting board</s-table-cell>
          <s-table-cell>CB-003</s-table-cell>
          <s-table-cell>
            <s-badge tone="critical">Out of stock</s-badge>
          </s-table-cell>
          <s-table-cell>0</s-table-cell>
          <s-table-cell>$34.99</s-table-cell>
          <s-table-cell>3 days ago</s-table-cell>
        </s-table-row>
        <s-table-row>
          <s-table-cell>Notebook set</s-table-cell>
          <s-table-cell>NB-004</s-table-cell>
          <s-table-cell>
            <s-badge tone="success">Active</s-badge>
          </s-table-cell>
          <s-table-cell>245</s-table-cell>
          <s-table-cell>$12.99</s-table-cell>
          <s-table-cell>5 hours ago</s-table-cell>
        </s-table-row>
        <s-table-row>
          <s-table-cell>Stainless steel straws</s-table-cell>
          <s-table-cell>SS-005</s-table-cell>
          <s-table-cell>
            <s-badge tone="success">Active</s-badge>
          </s-table-cell>
          <s-table-cell>89</s-table-cell>
          <s-table-cell>$9.99</s-table-cell>
          <s-table-cell>1 hour ago</s-table-cell>
        </s-table-row>
      </s-table-body>
    </s-table>
  </s-section>
  ```

  ##### html

  ```html
  <s-section padding="none">
    <s-table>
      <s-table-header-row>
        <s-table-header listSlot="primary">Product</s-table-header>
        <s-table-header listSlot="kicker">SKU</s-table-header>
        <s-table-header listSlot="inline">Status</s-table-header>
        <s-table-header listSlot="labeled" format="numeric">Inventory</s-table-header>
        <s-table-header listSlot="labeled" format="currency">Price</s-table-header>
        <s-table-header listSlot="labeled">Last updated</s-table-header>
      </s-table-header-row>

      <s-table-body>
        <s-table-row>
          <s-table-cell>Water bottle</s-table-cell>
          <s-table-cell>WB-001</s-table-cell>
          <s-table-cell>
            <s-badge tone="success">Active</s-badge>
          </s-table-cell>
          <s-table-cell>128</s-table-cell>
          <s-table-cell>$24.99</s-table-cell>
          <s-table-cell>2 hours ago</s-table-cell>
        </s-table-row>
        <s-table-row>
          <s-table-cell>T-shirt</s-table-cell>
          <s-table-cell>TS-002</s-table-cell>
          <s-table-cell>
            <s-badge tone="warning">Low stock</s-badge>
          </s-table-cell>
          <s-table-cell>15</s-table-cell>
          <s-table-cell>$19.99</s-table-cell>
          <s-table-cell>1 day ago</s-table-cell>
        </s-table-row>
        <s-table-row>
          <s-table-cell>Cutting board</s-table-cell>
          <s-table-cell>CB-003</s-table-cell>
          <s-table-cell>
            <s-badge tone="critical">Out of stock</s-badge>
          </s-table-cell>
          <s-table-cell>0</s-table-cell>
          <s-table-cell>$34.99</s-table-cell>
          <s-table-cell>3 days ago</s-table-cell>
        </s-table-row>
        <s-table-row>
          <s-table-cell>Notebook set</s-table-cell>
          <s-table-cell>NB-004</s-table-cell>
          <s-table-cell>
            <s-badge tone="success">Active</s-badge>
          </s-table-cell>
          <s-table-cell>245</s-table-cell>
          <s-table-cell>$12.99</s-table-cell>
          <s-table-cell>5 hours ago</s-table-cell>
        </s-table-row>
        <s-table-row>
          <s-table-cell>Stainless steel straws</s-table-cell>
          <s-table-cell>SS-005</s-table-cell>
          <s-table-cell>
            <s-badge tone="success">Active</s-badge>
          </s-table-cell>
          <s-table-cell>89</s-table-cell>
          <s-table-cell>$9.99</s-table-cell>
          <s-table-cell>1 hour ago</s-table-cell>
        </s-table-row>
      </s-table-body>
    </s-table>
  </s-section>
  ```

* #### List Variant

  ##### Description

  Display data using the list variant with specialized slot types. List is the default variant on mobile devices.

  ##### jsx

  ```jsx
  <s-section padding="none">  
    <s-table variant="list">
      <s-table-header-row>
        <s-table-header listSlot="kicker">ID</s-table-header>
        <s-table-header listSlot="primary">Customer</s-table-header>
        <s-table-header listSlot="secondary">Email</s-table-header>
        <s-table-header listSlot="inline">Status</s-table-header>
        <s-table-header listSlot="labeled" format="numeric">Orders</s-table-header>
        <s-table-header listSlot="labeled" format="currency">Total spent</s-table-header>
      </s-table-header-row>
      <s-table-body>
        <s-table-row>
          <s-table-cell>#1001</s-table-cell>
          <s-table-cell>Sarah Johnson</s-table-cell>
          <s-table-cell>sarah@example.com</s-table-cell>
          <s-table-cell>
            <s-badge tone="success">Active</s-badge>
          </s-table-cell>
          <s-table-cell>23</s-table-cell>
          <s-table-cell>$1,245.50</s-table-cell>
        </s-table-row>
        <s-table-row>
          <s-table-cell>#1002</s-table-cell>
          <s-table-cell>Mike Chen</s-table-cell>
          <s-table-cell>mike@example.com</s-table-cell>
          <s-table-cell>
            <s-badge tone="neutral">Inactive</s-badge>
          </s-table-cell>
          <s-table-cell>7</s-table-cell>
          <s-table-cell>$432.75</s-table-cell>
        </s-table-row>
        <s-table-row>
          <s-table-cell>#1003</s-table-cell>
          <s-table-cell>Emma Davis</s-table-cell>
          <s-table-cell>emma@example.com</s-table-cell>
          <s-table-cell>
            <s-badge tone="success">Active</s-badge>
          </s-table-cell>
          <s-table-cell>15</s-table-cell>
          <s-table-cell>$892.25</s-table-cell>
        </s-table-row>
      </s-table-body>
    </s-table>
  </s-section>
  ```

  ##### html

  ```html
  <s-section padding="none">
    <s-table variant="list">
      <s-table-header-row>
        <s-table-header listSlot="kicker">ID</s-table-header>
        <s-table-header listSlot="primary">Customer</s-table-header>
        <s-table-header listSlot="secondary">Email</s-table-header>
        <s-table-header listSlot="inline">Status</s-table-header>
        <s-table-header listSlot="labeled" format="numeric">
          Orders
        </s-table-header>
        <s-table-header listSlot="labeled" format="currency">
          Total spent
        </s-table-header>
      </s-table-header-row>
      <s-table-body>
        <s-table-row>
          <s-table-cell>#1001</s-table-cell>
          <s-table-cell>Sarah Johnson</s-table-cell>
          <s-table-cell>sarah@example.com</s-table-cell>
          <s-table-cell>
            <s-badge tone="success">Active</s-badge>
          </s-table-cell>
          <s-table-cell>23</s-table-cell>
          <s-table-cell>$1,245.50</s-table-cell>
        </s-table-row>
        <s-table-row>
          <s-table-cell>#1002</s-table-cell>
          <s-table-cell>Mike Chen</s-table-cell>
          <s-table-cell>mike@example.com</s-table-cell>
          <s-table-cell>
            <s-badge tone="neutral">Inactive</s-badge>
          </s-table-cell>
          <s-table-cell>7</s-table-cell>
          <s-table-cell>$432.75</s-table-cell>
        </s-table-row>
        <s-table-row>
          <s-table-cell>#1003</s-table-cell>
          <s-table-cell>Emma Davis</s-table-cell>
          <s-table-cell>emma@example.com</s-table-cell>
          <s-table-cell>
            <s-badge tone="success">Active</s-badge>
          </s-table-cell>
          <s-table-cell>15</s-table-cell>
          <s-table-cell>$892.25</s-table-cell>
        </s-table-row>
      </s-table-body>
    </s-table>
  </s-section>
  ```

## Best practices

* Use when displaying data with 3 or more attributes per item
* All items should share the same structure and attributes
* Don't use when data varies significantly between items (use a list instead)
* Tables automatically transform into lists on mobile devices

## Related

[Composition - Index table](https://shopify.dev/docs/api/app-home/patterns/compositions/index-table)

---
title: Index
description: >-
  The index layout lets merchants view and manage all their objects at once in a
  table format. They can filter, sort and do quick actions on their objects. To
  prevent tables from becoming visually cluttered, reveal actions only when the
  row is hovered over or selected

    | Used to | Examples |
    | --- | --- |
    | View all objects at once | Products, orders, customers, discounts |
    | Perform bulk actions | Delete products, pause/activate campaigns |

    ![Preview of the index pattern](/images/templated-apis-screenshots/admin/patterns/index-example.png)

    This pattern uses `Badge`, `Box`, `Button`, `Clickable`, `Grid`, `Heading`, `Image`, `Link`, `Paragraph`, `Section`, `Stack`, and `Table` components.

    ---

    ## Design guidelines
    Design your index page so users can organize and take action on resource objects.

    ### Navigation

    * Users must be able to return to the previous page without using the browser button. To achieve this, your app can provide breadcrumbs or a Back button on the page.
    * Offer users clear and predictable action labels.

    ---

    ### Layout

    * Design your app to be responsive and adapt to different screen sizes and devices. This ensures a seamless user experience across various platforms.
    * For resource index pages, use a full-width page. This is helpful when users are dealing with lists of data that have many columns.

    ---

    <style>
            div[class*="CodeBlock-module-CodeBlock_"] {
          max-height: calc(100vh - 400px) !important;
      }
      div[class*="Tabs-module-TabsContent_"] {
        overflow: auto !important;
      }
      div[class*="Screenshot-module-Screenshot_"] {
        display: none !important;
      }
    </style>
api_name: app-home
source_url:
  html: 'https://shopify.dev/docs/api/app-home/patterns/templates/index'
  md: 'https://shopify.dev/docs/api/app-home/patterns/templates/index.md'
---

# Index

The index layout lets merchants view and manage all their objects at once in a table format. They can filter, sort and do quick actions on their objects. To prevent tables from becoming visually cluttered, reveal actions only when the row is hovered over or selected

| Used to | Examples |
| - | - |
| View all objects at once | Products, orders, customers, discounts |
| Perform bulk actions | Delete products, pause/activate campaigns |

![Preview of the index pattern](https://shopify.dev/images/templated-apis-screenshots/admin/patterns/index-example.png)

This pattern uses `Badge`, `Box`, `Button`, `Clickable`, `Grid`, `Heading`, `Image`, `Link`, `Paragraph`, `Section`, `Stack`, and `Table` components.

***

## Design guidelines

Design your index page so users can organize and take action on resource objects.

### Navigation

* Users must be able to return to the previous page without using the browser button. To achieve this, your app can provide breadcrumbs or a Back button on the page.
* Offer users clear and predictable action labels.

***

### Layout

* Design your app to be responsive and adapt to different screen sizes and devices. This ensures a seamless user experience across various platforms.
* For resource index pages, use a full-width page. This is helpful when users are dealing with lists of data that have many columns.

***

Examples

### Examples

* #### Index

  ##### jsx

  ```jsx
  <s-page heading="Puzzles">
        <s-button slot="primary-action" variant="primary">
          Create puzzle
        </s-button>
        <s-button slot="secondary-actions" variant="secondary">
          Export puzzles
        </s-button>
        <s-button slot="secondary-actions" variant="secondary">
          Import puzzles
        </s-button>
        {/* === */}
        {/* Empty state */}
        {/* This should only be visible if the merchant has not created any puzzles yet. */}
        {/* === */}
        <s-section accessibilityLabel="Empty state section">
          <s-grid gap="base" justifyItems="center" paddingBlock="large-400">
            <s-box maxInlineSize="200px" maxBlockSize="200px">
              {/* aspectRatio should match the actual image dimensions (width/height) */}
              <s-image
                aspectRatio="1/0.5"
                src="https://cdn.shopify.com/static/images/polaris/patterns/callout.png"
                alt="A stylized graphic of four characters, each holding a puzzle piece"
              />
            </s-box>
            <s-grid justifyItems="center" maxInlineSize="450px" gap="base">
              <s-stack alignItems="center">
                <s-heading>Start creating puzzles</s-heading>
                <s-paragraph>
                  Create and manage your collection of puzzles for players to
                  enjoy.
                </s-paragraph>
              </s-stack>
              <s-button-group>
                <s-button
                  slot="secondary-actions"
                  accessibilityLabel="Learn more about creating puzzles"
                >
                  {" "}
                  Learn more{" "}
                </s-button>
                <s-button slot="primary-action" accessibilityLabel="Add a new puzzle">
                  {" "}
                  Create puzzle{" "}
                </s-button>
              </s-button-group>
            </s-grid>
          </s-grid>
        </s-section>

        {/* === */}
        {/* Table */}
        {/* This should only be visible if the merchant has created one or more puzzles. */}
        {/* === */}
        <s-section padding="none" accessibilityLabel="Puzzles table section">
          <s-table>
            <s-table-header-row>
              <s-table-header listSlot="primary">Puzzle</s-table-header>
              <s-table-header format="numeric">Pieces</s-table-header>
              <s-table-header>Created</s-table-header>
              <s-table-header>Status</s-table-header>
            </s-table-header-row>
            <s-table-body>
              <s-table-row>
                <s-table-cell>
                  <s-stack direction="inline" gap="small" alignItems="center">
                    <s-clickable
                      href="/app/details"
                      accessibilityLabel="Mountain View puzzle thumbnail"
                      border="base"
                      borderRadius="base"
                      overflow="hidden"
                      inlineSize="40px"
                      blockSize="40px"
                    >
                      <s-image
                        objectFit="cover"
                        alt="Mountain View puzzle thumbnail"
                        src="https://picsum.photos/id/29/80/80"
                       />
                    </s-clickable>
                    <s-link href="/app/details">Mountain View</s-link>
                  </s-stack>
                </s-table-cell>
                <s-table-cell>16</s-table-cell>
                <s-table-cell>Today</s-table-cell>
                <s-table-cell>
                  <s-badge color="base" tone="success">
                    Active
                  </s-badge>
                </s-table-cell>
              </s-table-row>
              <s-table-row>
                <s-table-cell>
                  <s-stack direction="inline" gap="small" alignItems="center">
                    <s-clickable
                      href="/app/details"
                      accessibilityLabel="Ocean Sunset puzzle thumbnail"
                      border="base"
                      borderRadius="base"
                      overflow="hidden"
                      inlineSize="40px"
                      blockSize="40px"
                    >
                      <s-image
                        objectFit="cover"
                        alt="Ocean Sunset puzzle thumbnail"
                        src="https://picsum.photos/id/12/80/80"
                       />
                    </s-clickable>
                    <s-link href="/app/details">Ocean Sunset</s-link>
                  </s-stack>
                </s-table-cell>
                <s-table-cell>9</s-table-cell>
                <s-table-cell>Yesterday</s-table-cell>
                <s-table-cell>
                  <s-badge color="base" tone="success">
                    Active
                  </s-badge>
                </s-table-cell>
              </s-table-row>
              <s-table-row>
                <s-table-cell>
                  <s-stack direction="inline" gap="small" alignItems="center">
                    <s-clickable
                      href="/app/details"
                      accessibilityLabel="Forest Animals puzzle thumbnail"
                      border="base"
                      borderRadius="base"
                      overflow="hidden"
                      inlineSize="40px"
                      blockSize="40px"
                    >
                      <s-image
                        objectFit="cover"
                        alt="Forest Animals puzzle thumbnail"
                        src="https://picsum.photos/id/324/80/80"
                       />
                    </s-clickable>
                    <s-link href="/app/details">Forest Animals</s-link>
                  </s-stack>
                </s-table-cell>
                <s-table-cell>25</s-table-cell>
                <s-table-cell>Last week</s-table-cell>
                <s-table-cell>
                  <s-badge color="base" tone="neutral">
                    Draft
                  </s-badge>
                </s-table-cell>
              </s-table-row>
              {/* Add more rows as needed here */}
              {/* If more than 100 rows are needed, index page tables should use the paginate, hasPreviousPage, hasNextPage, onPreviousPage, and onNextPage attributes to display and handle pagination) */}
            </s-table-body>
        </s-table>
      </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <script src="https://cdn.shopify.com/shopifycloud/polaris.js"></script>
      <title>Pattern</title>
    </head>
    <body>
      <!-- === -->
      <!-- Index page pattern -->
      <!-- === -->
      <s-page heading="Puzzles">
        <s-button slot="primary-action" variant="primary">Create puzzle</s-button>
        <s-button slot="secondary-actions" variant="secondary">Export puzzles</s-button>
        <s-button slot="secondary-actions" variant="secondary">Import puzzles</s-button>
        <!-- === -->
        <!-- Empty state -->
        <!-- This should only be visible if the merchant has not created any puzzles yet. -->
        <!-- === -->
        <s-section accessibilityLabel="Empty state section">
          <s-grid gap="base" justifyItems="center" paddingBlock="large-400">
            <s-box maxInlineSize="200px" maxBlockSize="200px">
              <!-- aspectRatio should match the actual image dimensions (width/height) -->
              <s-image
                maxInlineSize="200px"
                maxBlockSize="200px"
                aspectRatio="1/0.5"
                src="https://cdn.shopify.com/static/images/polaris/patterns/callout.png"
                alt="A stylized graphic of four characters, each holding a puzzle piece"
              />
            </s-box>
            <s-grid justifyItems="center" maxInlineSize="450px" gap="base">
              <s-stack alignItems="center">
                <s-heading>Start creating puzzles</s-heading>
                <s-paragraph>
                  Create and manage your collection of puzzles for players to enjoy.
                </s-paragraph>
              </s-stack>
              <s-button-group>
                <s-button slot="secondary-actions" aria-label="Learn more about creating puzzles"> Learn more </s-button>
                <s-button slot="primary-action" aria-label="Add a new puzzle"> Create puzzle </s-button>
              </s-button-group>
            </s-grid>
          </s-grid>
        </s-section>
        <!-- === -->
        <!-- Table -->
        <!-- This should only be visible if the merchant has created one or more puzzles. -->
        <!-- === -->
        <s-section padding="none" accessibilityLabel="Puzzles table section">
          <s-table>
            <s-table-header-row>
              <s-table-header listSlot="primary">Puzzle</s-table-header>
              <s-table-header format="numeric">Pieces</s-table-header>
              <s-table-header>Created</s-table-header>
              <s-table-header>Status</s-table-header>
            </s-table-header-row>
            <s-table-body>
              <s-table-row>
                <s-table-cell>
                  <s-stack direction="inline" gap="small" alignItems="center">
                    <s-clickable
                      href="/app/details"
                      accessibilityLabel="Mountain View puzzle thumbnail"
                      border="base"
                      borderRadius="base"
                      overflow="hidden"
                      inlineSize="40px"
                      blockSize="40px"
                    >
                      <s-image objectFit="cover" alt="Mountain View puzzle thumbnail" src="https://picsum.photos/id/29/80/80"></s-image>
                    </s-clickable>
                    <s-link href="/app/details">Mountain View</s-link>
                  </s-stack>
                </s-table-cell>
                <s-table-cell>16</s-table-cell>
                <s-table-cell>Today</s-table-cell>
                <s-table-cell>
                  <s-badge color="base" tone="success"> Active </s-badge>
                </s-table-cell>
              </s-table-row>
              <s-table-row>
                <s-table-cell>
                  <s-stack direction="inline" gap="small" alignItems="center">
                    <s-clickable
                      href="/app/details"
                      accessibilityLabel="Ocean Sunset puzzle thumbnail"
                      border="base"
                      borderRadius="base"
                      overflow="hidden"
                      inlineSize="40px"
                      blockSize="40px"
                    >
                      <s-image objectFit="cover" alt="Ocean Sunset puzzle thumbnail" src="https://picsum.photos/id/12/80/80"></s-image>
                    </s-clickable>
                    <s-link href="/app/details">Ocean Sunset</s-link>
                  </s-stack>
                </s-table-cell>
                <s-table-cell>9</s-table-cell>
                <s-table-cell>Yesterday</s-table-cell>
                <s-table-cell>
                  <s-badge color="base" tone="success"> Active </s-badge>
                </s-table-cell>
              </s-table-row>
              <s-table-row>
                <s-table-cell>
                  <s-stack direction="inline" gap="small" alignItems="center">
                    <s-clickable
                      href="/app/details"
                      accessibilityLabel="Forest Animals puzzle thumbnail"
                      border="base"
                      borderRadius="base"
                      overflow="hidden"
                      inlineSize="40px"
                      blockSize="40px"
                    >
                      <s-image objectFit="cover" alt="Forest Animals puzzle thumbnail" src="https://picsum.photos/id/324/80/80"></s-image>
                    </s-clickable>
                    <s-link href="/app/details">Forest Animals</s-link>
                  </s-stack>
                </s-table-cell>
                <s-table-cell>25</s-table-cell>
                <s-table-cell>Last week</s-table-cell>
                <s-table-cell>
                  <s-badge color="base" tone="neutral"> Draft </s-badge>
                </s-table-cell>
              </s-table-row>
              <!-- Add more rows as needed here -->
              <!-- If more than 100 rows are needed, index page tables should use the paginate, hasPreviousPage, hasNextPage, onPreviousPage, and onNextPage attributes to display and handle pagination) -->
            </s-table-body>
          </s-table>
        </s-section>
      </s-page>
    </body>
  </html>
  ```

## Related

[Requirements - Built for Shopify](https://shopify.dev/docs/apps/launch/built-for-shopify/requirements)

Task alerts
Task alerts are initiated in response to merchant actions during a specific task. Task alerts give merchants direct and immediate feedback.

The following are examples of task alerts:

A form is successfully submitted.
There's problem uploading something.
The information provided is incorrect or doesn't match the requested format.

Task alerts
Task alerts are initiated in response to merchant actions during a specific task. Task alerts give merchants direct and immediate feedback.

The following are examples of task alerts:

A form is successfully submitted.
There's problem uploading something.
The information provided is incorrect or doesn't match the requested format.

Task alerts
Task alerts are initiated in response to merchant actions during a specific task. Task alerts give merchants direct and immediate feedback.

The following are examples of task alerts:

A form is successfully submitted.
There's problem uploading something.
The information provided is incorrect or doesn't match the requested format.

---
title: Index
description: >-
  The index layout lets merchants view and manage all their objects at once in a
  table format. They can filter, sort and do quick actions on their objects. To
  prevent tables from becoming visually cluttered, reveal actions only when the
  row is hovered over or selected

    | Used to | Examples |
    | --- | --- |
    | View all objects at once | Products, orders, customers, discounts |
    | Perform bulk actions | Delete products, pause/activate campaigns |

    ![Preview of the index pattern](/images/templated-apis-screenshots/admin/patterns/index-example.png)

    This pattern uses `Badge`, `Box`, `Button`, `Clickable`, `Grid`, `Heading`, `Image`, `Link`, `Paragraph`, `Section`, `Stack`, and `Table` components.

    ---

    ## Design guidelines
    Design your index page so users can organize and take action on resource objects.

    ### Navigation

    * Users must be able to return to the previous page without using the browser button. To achieve this, your app can provide breadcrumbs or a Back button on the page.
    * Offer users clear and predictable action labels.

    ---

    ### Layout

    * Design your app to be responsive and adapt to different screen sizes and devices. This ensures a seamless user experience across various platforms.
    * For resource index pages, use a full-width page. This is helpful when users are dealing with lists of data that have many columns.

    ---

    <style>
            div[class*="CodeBlock-module-CodeBlock_"] {
          max-height: calc(100vh - 400px) !important;
      }
      div[class*="Tabs-module-TabsContent_"] {
        overflow: auto !important;
      }
      div[class*="Screenshot-module-Screenshot_"] {
        display: none !important;
      }
    </style>
api_name: app-home
source_url:
  html: 'https://shopify.dev/docs/api/app-home/patterns/templates/index'
  md: 'https://shopify.dev/docs/api/app-home/patterns/templates/index.md'
---

# Index

The index layout lets merchants view and manage all their objects at once in a table format. They can filter, sort and do quick actions on their objects. To prevent tables from becoming visually cluttered, reveal actions only when the row is hovered over or selected

| Used to | Examples |
| - | - |
| View all objects at once | Products, orders, customers, discounts |
| Perform bulk actions | Delete products, pause/activate campaigns |

![Preview of the index pattern](https://shopify.dev/images/templated-apis-screenshots/admin/patterns/index-example.png)

This pattern uses `Badge`, `Box`, `Button`, `Clickable`, `Grid`, `Heading`, `Image`, `Link`, `Paragraph`, `Section`, `Stack`, and `Table` components.

***

## Design guidelines

Design your index page so users can organize and take action on resource objects.

### Navigation

* Users must be able to return to the previous page without using the browser button. To achieve this, your app can provide breadcrumbs or a Back button on the page.
* Offer users clear and predictable action labels.

***

### Layout

* Design your app to be responsive and adapt to different screen sizes and devices. This ensures a seamless user experience across various platforms.
* For resource index pages, use a full-width page. This is helpful when users are dealing with lists of data that have many columns.

***

Examples

### Examples

* #### Index

  ##### jsx

  ```jsx
  <s-page heading="Puzzles">
        <s-button slot="primary-action" variant="primary">
          Create puzzle
        </s-button>
        <s-button slot="secondary-actions" variant="secondary">
          Export puzzles
        </s-button>
        <s-button slot="secondary-actions" variant="secondary">
          Import puzzles
        </s-button>
        {/* === */}
        {/* Empty state */}
        {/* This should only be visible if the merchant has not created any puzzles yet. */}
        {/* === */}
        <s-section accessibilityLabel="Empty state section">
          <s-grid gap="base" justifyItems="center" paddingBlock="large-400">
            <s-box maxInlineSize="200px" maxBlockSize="200px">
              {/* aspectRatio should match the actual image dimensions (width/height) */}
              <s-image
                aspectRatio="1/0.5"
                src="https://cdn.shopify.com/static/images/polaris/patterns/callout.png"
                alt="A stylized graphic of four characters, each holding a puzzle piece"
              />
            </s-box>
            <s-grid justifyItems="center" maxInlineSize="450px" gap="base">
              <s-stack alignItems="center">
                <s-heading>Start creating puzzles</s-heading>
                <s-paragraph>
                  Create and manage your collection of puzzles for players to
                  enjoy.
                </s-paragraph>
              </s-stack>
              <s-button-group>
                <s-button
                  slot="secondary-actions"
                  accessibilityLabel="Learn more about creating puzzles"
                >
                  {" "}
                  Learn more{" "}
                </s-button>
                <s-button slot="primary-action" accessibilityLabel="Add a new puzzle">
                  {" "}
                  Create puzzle{" "}
                </s-button>
              </s-button-group>
            </s-grid>
          </s-grid>
        </s-section>

        {/* === */}
        {/* Table */}
        {/* This should only be visible if the merchant has created one or more puzzles. */}
        {/* === */}
        <s-section padding="none" accessibilityLabel="Puzzles table section">
          <s-table>
            <s-table-header-row>
              <s-table-header listSlot="primary">Puzzle</s-table-header>
              <s-table-header format="numeric">Pieces</s-table-header>
              <s-table-header>Created</s-table-header>
              <s-table-header>Status</s-table-header>
            </s-table-header-row>
            <s-table-body>
              <s-table-row>
                <s-table-cell>
                  <s-stack direction="inline" gap="small" alignItems="center">
                    <s-clickable
                      href="/app/details"
                      accessibilityLabel="Mountain View puzzle thumbnail"
                      border="base"
                      borderRadius="base"
                      overflow="hidden"
                      inlineSize="40px"
                      blockSize="40px"
                    >
                      <s-image
                        objectFit="cover"
                        alt="Mountain View puzzle thumbnail"
                        src="https://picsum.photos/id/29/80/80"
                       />
                    </s-clickable>
                    <s-link href="/app/details">Mountain View</s-link>
                  </s-stack>
                </s-table-cell>
                <s-table-cell>16</s-table-cell>
                <s-table-cell>Today</s-table-cell>
                <s-table-cell>
                  <s-badge color="base" tone="success">
                    Active
                  </s-badge>
                </s-table-cell>
              </s-table-row>
              <s-table-row>
                <s-table-cell>
                  <s-stack direction="inline" gap="small" alignItems="center">
                    <s-clickable
                      href="/app/details"
                      accessibilityLabel="Ocean Sunset puzzle thumbnail"
                      border="base"
                      borderRadius="base"
                      overflow="hidden"
                      inlineSize="40px"
                      blockSize="40px"
                    >
                      <s-image
                        objectFit="cover"
                        alt="Ocean Sunset puzzle thumbnail"
                        src="https://picsum.photos/id/12/80/80"
                       />
                    </s-clickable>
                    <s-link href="/app/details">Ocean Sunset</s-link>
                  </s-stack>
                </s-table-cell>
                <s-table-cell>9</s-table-cell>
                <s-table-cell>Yesterday</s-table-cell>
                <s-table-cell>
                  <s-badge color="base" tone="success">
                    Active
                  </s-badge>
                </s-table-cell>
              </s-table-row>
              <s-table-row>
                <s-table-cell>
                  <s-stack direction="inline" gap="small" alignItems="center">
                    <s-clickable
                      href="/app/details"
                      accessibilityLabel="Forest Animals puzzle thumbnail"
                      border="base"
                      borderRadius="base"
                      overflow="hidden"
                      inlineSize="40px"
                      blockSize="40px"
                    >
                      <s-image
                        objectFit="cover"
                        alt="Forest Animals puzzle thumbnail"
                        src="https://picsum.photos/id/324/80/80"
                       />
                    </s-clickable>
                    <s-link href="/app/details">Forest Animals</s-link>
                  </s-stack>
                </s-table-cell>
                <s-table-cell>25</s-table-cell>
                <s-table-cell>Last week</s-table-cell>
                <s-table-cell>
                  <s-badge color="base" tone="neutral">
                    Draft
                  </s-badge>
                </s-table-cell>
              </s-table-row>
              {/* Add more rows as needed here */}
              {/* If more than 100 rows are needed, index page tables should use the paginate, hasPreviousPage, hasNextPage, onPreviousPage, and onNextPage attributes to display and handle pagination) */}
            </s-table-body>
        </s-table>
      </s-section>
  </s-page>
  ```

  ##### html

  ```html
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <script src="https://cdn.shopify.com/shopifycloud/polaris.js"></script>
      <title>Pattern</title>
    </head>
    <body>
      <!-- === -->
      <!-- Index page pattern -->
      <!-- === -->
      <s-page heading="Puzzles">
        <s-button slot="primary-action" variant="primary">Create puzzle</s-button>
        <s-button slot="secondary-actions" variant="secondary">Export puzzles</s-button>
        <s-button slot="secondary-actions" variant="secondary">Import puzzles</s-button>
        <!-- === -->
        <!-- Empty state -->
        <!-- This should only be visible if the merchant has not created any puzzles yet. -->
        <!-- === -->
        <s-section accessibilityLabel="Empty state section">
          <s-grid gap="base" justifyItems="center" paddingBlock="large-400">
            <s-box maxInlineSize="200px" maxBlockSize="200px">
              <!-- aspectRatio should match the actual image dimensions (width/height) -->
              <s-image
                maxInlineSize="200px"
                maxBlockSize="200px"
                aspectRatio="1/0.5"
                src="https://cdn.shopify.com/static/images/polaris/patterns/callout.png"
                alt="A stylized graphic of four characters, each holding a puzzle piece"
              />
            </s-box>
            <s-grid justifyItems="center" maxInlineSize="450px" gap="base">
              <s-stack alignItems="center">
                <s-heading>Start creating puzzles</s-heading>
                <s-paragraph>
                  Create and manage your collection of puzzles for players to enjoy.
                </s-paragraph>
              </s-stack>
              <s-button-group>
                <s-button slot="secondary-actions" aria-label="Learn more about creating puzzles"> Learn more </s-button>
                <s-button slot="primary-action" aria-label="Add a new puzzle"> Create puzzle </s-button>
              </s-button-group>
            </s-grid>
          </s-grid>
        </s-section>
        <!-- === -->
        <!-- Table -->
        <!-- This should only be visible if the merchant has created one or more puzzles. -->
        <!-- === -->
        <s-section padding="none" accessibilityLabel="Puzzles table section">
          <s-table>
            <s-table-header-row>
              <s-table-header listSlot="primary">Puzzle</s-table-header>
              <s-table-header format="numeric">Pieces</s-table-header>
              <s-table-header>Created</s-table-header>
              <s-table-header>Status</s-table-header>
            </s-table-header-row>
            <s-table-body>
              <s-table-row>
                <s-table-cell>
                  <s-stack direction="inline" gap="small" alignItems="center">
                    <s-clickable
                      href="/app/details"
                      accessibilityLabel="Mountain View puzzle thumbnail"
                      border="base"
                      borderRadius="base"
                      overflow="hidden"
                      inlineSize="40px"
                      blockSize="40px"
                    >
                      <s-image objectFit="cover" alt="Mountain View puzzle thumbnail" src="https://picsum.photos/id/29/80/80"></s-image>
                    </s-clickable>
                    <s-link href="/app/details">Mountain View</s-link>
                  </s-stack>
                </s-table-cell>
                <s-table-cell>16</s-table-cell>
                <s-table-cell>Today</s-table-cell>
                <s-table-cell>
                  <s-badge color="base" tone="success"> Active </s-badge>
                </s-table-cell>
              </s-table-row>
              <s-table-row>
                <s-table-cell>
                  <s-stack direction="inline" gap="small" alignItems="center">
                    <s-clickable
                      href="/app/details"
                      accessibilityLabel="Ocean Sunset puzzle thumbnail"
                      border="base"
                      borderRadius="base"
                      overflow="hidden"
                      inlineSize="40px"
                      blockSize="40px"
                    >
                      <s-image objectFit="cover" alt="Ocean Sunset puzzle thumbnail" src="https://picsum.photos/id/12/80/80"></s-image>
                    </s-clickable>
                    <s-link href="/app/details">Ocean Sunset</s-link>
                  </s-stack>
                </s-table-cell>
                <s-table-cell>9</s-table-cell>
                <s-table-cell>Yesterday</s-table-cell>
                <s-table-cell>
                  <s-badge color="base" tone="success"> Active </s-badge>
                </s-table-cell>
              </s-table-row>
              <s-table-row>
                <s-table-cell>
                  <s-stack direction="inline" gap="small" alignItems="center">
                    <s-clickable
                      href="/app/details"
                      accessibilityLabel="Forest Animals puzzle thumbnail"
                      border="base"
                      borderRadius="base"
                      overflow="hidden"
                      inlineSize="40px"
                      blockSize="40px"
                    >
                      <s-image objectFit="cover" alt="Forest Animals puzzle thumbnail" src="https://picsum.photos/id/324/80/80"></s-image>
                    </s-clickable>
                    <s-link href="/app/details">Forest Animals</s-link>
                  </s-stack>
                </s-table-cell>
                <s-table-cell>25</s-table-cell>
                <s-table-cell>Last week</s-table-cell>
                <s-table-cell>
                  <s-badge color="base" tone="neutral"> Draft </s-badge>
                </s-table-cell>
              </s-table-row>
              <!-- Add more rows as needed here -->
              <!-- If more than 100 rows are needed, index page tables should use the paginate, hasPreviousPage, hasNextPage, onPreviousPage, and onNextPage attributes to display and handle pagination) -->
            </s-table-body>
          </s-table>
        </s-section>
      </s-page>
    </body>
  </html>
  ```

## Related

[Requirements - Built for Shopify](https://shopify.dev/docs/apps/launch/built-for-shopify/requirements)


---
title: Settings
description: >-
  Make settings pages easy to scan by grouping related information in a logical
  order. For complex or lengthy settings, organize content into distinct, themed
  sections that link to their own pages.
    | Used to | Examples |
    | --- | --- |
    | Find and change app settings | Membership settings, app appearance, set up theme blocks |

    ![Preview of the settings pattern](/images/templated-apis-screenshots/admin/patterns/settings-example.png)

    This pattern uses `Box`, `Button`, `ChoiceList`, `Clickable`, `Divider`, `Grid`, `Heading`, `Icon`, `Paragraph`, `Section`, `Select`, `Stack`, and `TextField` components.

    ---

    ## Design guidelines
    Design scannable settings pages with groups of related information placed in logical order.

    ### Navigation

    * Users must be able to return to the previous page without using the browser button. To achieve this, your app can provide breadcrumbs or a Back button on the page.
    * Offer users clear and predictable action labels.

    ---

    ### Visual design

    Design your app to be responsive and adapt to different screen sizes and devices. This ensures a seamless user experience across various platforms.

    * Use looser spacing for low-density layouts. Use tighter spacing for high-density layouts.
    * Use high-resolution photos and images to ensure a professional, high-quality experience.

    ---

    <style>
      div[class*="CodeBlock-module-CodeBlock_"] {
        max-height: calc(100vh - 80px) !important;
      }
      div[class*="Tabs-module-TabsContent_"] {
        overflow: auto !important;
      }
      div[class*="Screenshot-module-Screenshot_"] {
        display: none !important;
      }
    </style>
api_name: app-home
source_url:
  html: 'https://shopify.dev/docs/api/app-home/patterns/templates/settings'
  md: 'https://shopify.dev/docs/api/app-home/patterns/templates/settings.md'
---

# Settings

Make settings pages easy to scan by grouping related information in a logical order. For complex or lengthy settings, organize content into distinct, themed sections that link to their own pages.

| Used to | Examples |
| - | - |
| Find and change app settings | Membership settings, app appearance, set up theme blocks |

![Preview of the settings pattern](https://shopify.dev/images/templated-apis-screenshots/admin/patterns/settings-example.png)

This pattern uses `Box`, `Button`, `ChoiceList`, `Clickable`, `Divider`, `Grid`, `Heading`, `Icon`, `Paragraph`, `Section`, `Select`, `Stack`, and `TextField` components.

***

## Design guidelines

Design scannable settings pages with groups of related information placed in logical order.

### Navigation

* Users must be able to return to the previous page without using the browser button. To achieve this, your app can provide breadcrumbs or a Back button on the page.
* Offer users clear and predictable action labels.

***

### Visual design

Design your app to be responsive and adapt to different screen sizes and devices. This ensures a seamless user experience across various platforms.

* Use looser spacing for low-density layouts. Use tighter spacing for high-density layouts.
* Use high-resolution photos and images to ensure a professional, high-quality experience.

***

Examples

### Examples

* #### Settings

  ##### jsx

  ```jsx
  <form
    data-save-bar
    onSubmit={(event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      const formEntries = Object.fromEntries(formData);
      console.log("Form data", formEntries);
    }}
    onReset={(event) => {
      console.log("Handle discarded changes if necessary");
    }}
  >
        <s-page heading="Settings" inlineSize="small">
          {/* === */}
          {/* Store Information */}
          {/* === */}
          <s-section heading="Store Information">
            <s-text-field
              label="Store name"
              name="store-name"
              value="Puzzlify Store"
              placeholder="Enter store name"
            />
            <s-text-field
              label="Business address"
              name="business-address"
              value="123 Main St, Anytown, USA"
              placeholder="Enter business address"
            />
            <s-text-field
              label="Store phone"
              name="store-phone"
              value="+1 (555) 123-4567"
              placeholder="Enter phone number"
            />
            <s-choice-list label="Primary currency" name="currency">
              <s-choice value="usd" selected>
                US Dollar ($)
              </s-choice>
              <s-choice value="cad">Canadian Dollar (CAD)</s-choice>
              <s-choice value="eur">Euro (€)</s-choice>
            </s-choice-list>
          </s-section>

          {/* === */}
          {/* Notifications */}
          {/* === */}
          <s-section heading="Notifications">
            <s-select
              label="Notification frequency"
              name="notification-frequency"
            >
              <s-option value="immediately" selected>
                Immediately
              </s-option>
              <s-option value="hourly">Hourly digest</s-option>
              <s-option value="daily">Daily digest</s-option>
            </s-select>
            <s-choice-list
              label="Notification types"
              name="notifications-type"
              multiple
            >
              <s-choice value="new-order" selected>
                New order notifications
              </s-choice>
              <s-choice value="low-stock">Low stock alerts</s-choice>
              <s-choice value="customer-review">
                Customer review notifications
              </s-choice>
              <s-choice value="shipping-updates">Shipping updates</s-choice>
            </s-choice-list>
          </s-section>

          {/* === */}
          {/* Preferences */}
          {/* === */}
          <s-section heading="Preferences">
            <s-box border="base" borderRadius="base">
              <s-clickable
                padding="small-100"
                href="/app/settings/shipping"
                accessibilityLabel="Configure shipping methods, rates, and fulfillment options"
              >
                <s-grid
                  gridTemplateColumns="1fr auto"
                  alignItems="center"
                  gap="base"
                >
                  <s-box>
                    <s-heading>Shipping & fulfillment</s-heading>
                    <s-paragraph color="subdued">
                      Shipping methods, rates, zones, and fulfillment preferences.
                    </s-paragraph>
                  </s-box>
                  <s-icon type="chevron-right" />
                </s-grid>
              </s-clickable>
              <s-box paddingInline="small-100">
                <s-divider />
              </s-box>

              <s-clickable
                padding="small-100"
                href="/app/settings/products_catalog"
                accessibilityLabel="Configure product defaults, customer experience, and catalog settings"
              >
                <s-grid
                  gridTemplateColumns="1fr auto"
                  alignItems="center"
                  gap="base"
                >
                  <s-box>
                    <s-heading>Products & catalog</s-heading>
                    <s-paragraph color="subdued">
                      Product defaults, customer experience, and catalog display
                      options.
                    </s-paragraph>
                  </s-box>
                  <s-icon type="chevron-right" />
                </s-grid>
              </s-clickable>
              <s-box paddingInline="small-100">
                <s-divider />
              </s-box>

              <s-clickable
                padding="small-100"
                href="/app/settings/customer_support"
                accessibilityLabel="Manage customer support settings and help resources"
              >
                <s-grid
                  gridTemplateColumns="1fr auto"
                  alignItems="center"
                  gap="base"
                >
                  <s-box>
                    <s-heading>Customer support</s-heading>
                    <s-paragraph color="subdued">
                      Support settings, help resources, and customer service
                      tools.
                    </s-paragraph>
                  </s-box>
                  <s-icon type="chevron-right" />
                </s-grid>
              </s-clickable>
            </s-box>
          </s-section>

          {/* === */}
          {/* Tools */}
          {/* === */}
          <s-section heading="Tools">
            <s-stack
              gap="none"
              border="base"
              borderRadius="base"
              overflow="hidden"
            >
              <s-box padding="small-100">
                <s-grid
                  gridTemplateColumns="1fr auto"
                  alignItems="center"
                  gap="base"
                >
                  <s-box>
                    <s-heading>Reset app settings</s-heading>
                    <s-paragraph color="subdued">
                      Reset all settings to their default values. This action
                      cannot be undone.
                    </s-paragraph>
                  </s-box>
                  <s-button tone="critical">Reset</s-button>
                </s-grid>
              </s-box>
              <s-box paddingInline="small-100">
                <s-divider />
              </s-box>

              <s-box padding="small-100">
                <s-grid
                  gridTemplateColumns="1fr auto"
                  alignItems="center"
                  gap="base"
                >
                  <s-box>
                    <s-heading>Export settings</s-heading>
                    <s-paragraph color="subdued">
                      Download a backup of all your current settings.
                    </s-paragraph>
                  </s-box>
                  <s-button>Export</s-button>
                </s-grid>
              </s-box>
            </s-stack>
        </s-section>
    </s-page>
  </form>
  ```

  ##### html

  ```html
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <script src="https://cdn.shopify.com/shopifycloud/polaris.js"></script>
      <title>Pattern</title>
    </head>
    <body>
      <!-- === -->
      <!-- Settings page pattern -->
      <!-- === -->
      <form data-save-bar onSubmit="" onReset="">
        <s-page heading="Settings" inlineSize="small">
          <!-- === -->
          <!-- Store Information -->
          <!-- === -->
          <s-section heading="Store Information">
            <s-text-field
              label="Store name"
              name="store-name"
              value="Puzzlify Store"
              placeholder="Enter store name"
            ></s-text-field>
            <s-text-field
              label="Business address"
              name="business-address"
              value="123 Main St, Anytown, USA"
              placeholder="Enter business address"
            ></s-text-field>
            <s-text-field
              label="Store phone"
              name="store-phone"
              value="+1 (555) 123-4567"
              placeholder="Enter phone number"
            ></s-text-field>
            <s-choice-list label="Primary currency" name="currency">
              <s-choice value="usd" selected>US Dollar ($)</s-choice>
              <s-choice value="cad">Canadian Dollar (CAD)</s-choice>
              <s-choice value="eur">Euro (€)</s-choice>
            </s-choice-list>
          </s-section>
          <!-- === -->
          <!-- Notifications -->
          <!-- === -->
          <s-section heading="Notifications">
            <s-select
              label="Notification frequency"
              name="notification-frequency"
            >
              <s-option value="immediately" selected>Immediately</s-option>
              <s-option value="hourly">Hourly digest</s-option>
              <s-option value="daily">Daily digest</s-option>
            </s-select>
            <s-choice-list
              label="Notification types"
              name="notifications-type"
              multiple
            >
              <s-choice value="new-order" selected
                >New order notifications</s-choice
              >
              <s-choice value="low-stock">Low stock alerts</s-choice>
              <s-choice value="customer-review"
                >Customer review notifications</s-choice
              >
              <s-choice value="shipping-updates">Shipping updates</s-choice>
            </s-choice-list>
          </s-section>
          <!-- === -->
          <!-- Preferences -->
          <!-- === -->
          <s-section heading="Preferences">
            <s-box
              border="base"
              borderRadius="base"
            >
              <s-clickable
                padding="small-100"
                href="/app/settings/shipping"
                accessibilityLabel="Configure shipping methods, rates, and fulfillment options"
              >
                <s-grid
                  gridTemplateColumns="1fr auto"
                  alignItems="center"
                  gap="base"
                >
                  <s-box>
                    <s-heading>Shipping & fulfillment</s-heading>
                    <s-paragraph color="subdued">
                      Shipping methods, rates, zones, and fulfillment preferences.
                    </s-paragraph>
                  </s-box>
                  <s-icon type="chevron-right"></s-icon>
                </s-grid>
              </s-clickable>
              <s-box paddingInline="small-100">
                <s-divider></s-divider>
              </s-box>
              <s-clickable
                padding="small-100"
                href="/app/settings/products_catalog"
                accessibilityLabel="Configure product defaults, customer experience, and catalog settings"
              >
                <s-grid
                  gridTemplateColumns="1fr auto"
                  alignItems="center"
                  gap="base"
                >
                  <s-box>
                    <s-heading>Products & catalog</s-heading>
                    <s-paragraph color="subdued">
                      Product defaults, customer experience, and catalog display
                      options.
                    </s-paragraph>
                  </s-box>
                  <s-icon type="chevron-right"></s-icon>
                </s-grid>
              </s-clickable>
              <s-box paddingInline="small-100">
                <s-divider></s-divider>
              </s-box>
              <s-clickable
                padding="small-100"
                href="/app/settings/customer_support"
                accessibilityLabel="Manage customer support settings and help resources"
              >
                <s-grid
                  gridTemplateColumns="1fr auto"
                  alignItems="center"
                  gap="base"
                >
                  <s-box>
                    <s-heading>Customer support</s-heading>
                    <s-paragraph color="subdued">
                      Support settings, help resources, and customer service
                      tools.
                    </s-paragraph>
                  </s-box>
                  <s-icon type="chevron-right"></s-icon>
                </s-grid>
              </s-clickable>
            </s-box>
          </s-section>
          <!-- === -->
          <!-- Tools -->
          <!-- === -->
          <s-section heading="Tools">
            <s-stack
              gap="none"
              border="base"
              borderRadius="base"
              overflow="hidden"
            >
              <s-box padding="small-100">
                <s-grid
                  gridTemplateColumns="1fr auto"
                  alignItems="center"
                  gap="base"
                >
                  <s-box>
                    <s-heading>Reset app settings</s-heading>
                    <s-paragraph color="subdued">
                      Reset all settings to their default values. This action
                      cannot be undone.
                    </s-paragraph>
                  </s-box>
                  <s-button tone="critical">Reset</s-button>
                </s-grid>
              </s-box>
              <s-box paddingInline="small-100">
                <s-divider></s-divider>
              </s-box>
              <s-box padding="small-100">
                <s-grid
                  gridTemplateColumns="1fr auto"
                  alignItems="center"
                  gap="base"
                >
                  <s-box>
                    <s-heading>Export settings</s-heading>
                    <s-paragraph color="subdued">
                      Download a backup of all your current settings.
                    </s-paragraph>
                  </s-box>
                  <s-button>Export</s-button>
                </s-grid>
              </s-box>
            </s-stack>
          </s-section>
        </s-page>
      </form>
    </body>
  </html>
  ```

## Related

[Requirements - Built for Shopify](https://shopify.dev/docs/apps/launch/built-for-shopify/requirements)


---
title: Settings
description: >-
  Make settings pages easy to scan by grouping related information in a logical
  order. For complex or lengthy settings, organize content into distinct, themed
  sections that link to their own pages.
    | Used to | Examples |
    | --- | --- |
    | Find and change app settings | Membership settings, app appearance, set up theme blocks |

    ![Preview of the settings pattern](/images/templated-apis-screenshots/admin/patterns/settings-example.png)

    This pattern uses `Box`, `Button`, `ChoiceList`, `Clickable`, `Divider`, `Grid`, `Heading`, `Icon`, `Paragraph`, `Section`, `Select`, `Stack`, and `TextField` components.

    ---

    ## Design guidelines
    Design scannable settings pages with groups of related information placed in logical order.

    ### Navigation

    * Users must be able to return to the previous page without using the browser button. To achieve this, your app can provide breadcrumbs or a Back button on the page.
    * Offer users clear and predictable action labels.

    ---

    ### Visual design

    Design your app to be responsive and adapt to different screen sizes and devices. This ensures a seamless user experience across various platforms.

    * Use looser spacing for low-density layouts. Use tighter spacing for high-density layouts.
    * Use high-resolution photos and images to ensure a professional, high-quality experience.

    ---

    <style>
      div[class*="CodeBlock-module-CodeBlock_"] {
        max-height: calc(100vh - 80px) !important;
      }
      div[class*="Tabs-module-TabsContent_"] {
        overflow: auto !important;
      }
      div[class*="Screenshot-module-Screenshot_"] {
        display: none !important;
      }
    </style>
api_name: app-home
source_url:
  html: 'https://shopify.dev/docs/api/app-home/patterns/templates/settings'
  md: 'https://shopify.dev/docs/api/app-home/patterns/templates/settings.md'
---

# Settings

Make settings pages easy to scan by grouping related information in a logical order. For complex or lengthy settings, organize content into distinct, themed sections that link to their own pages.

| Used to | Examples |
| - | - |
| Find and change app settings | Membership settings, app appearance, set up theme blocks |

![Preview of the settings pattern](https://shopify.dev/images/templated-apis-screenshots/admin/patterns/settings-example.png)

This pattern uses `Box`, `Button`, `ChoiceList`, `Clickable`, `Divider`, `Grid`, `Heading`, `Icon`, `Paragraph`, `Section`, `Select`, `Stack`, and `TextField` components.

***

## Design guidelines

Design scannable settings pages with groups of related information placed in logical order.

### Navigation

* Users must be able to return to the previous page without using the browser button. To achieve this, your app can provide breadcrumbs or a Back button on the page.
* Offer users clear and predictable action labels.

***

### Visual design

Design your app to be responsive and adapt to different screen sizes and devices. This ensures a seamless user experience across various platforms.

* Use looser spacing for low-density layouts. Use tighter spacing for high-density layouts.
* Use high-resolution photos and images to ensure a professional, high-quality experience.

***

Examples

### Examples

* #### Settings

  ##### jsx

  ```jsx
  <form
    data-save-bar
    onSubmit={(event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      const formEntries = Object.fromEntries(formData);
      console.log("Form data", formEntries);
    }}
    onReset={(event) => {
      console.log("Handle discarded changes if necessary");
    }}
  >
        <s-page heading="Settings" inlineSize="small">
          {/* === */}
          {/* Store Information */}
          {/* === */}
          <s-section heading="Store Information">
            <s-text-field
              label="Store name"
              name="store-name"
              value="Puzzlify Store"
              placeholder="Enter store name"
            />
            <s-text-field
              label="Business address"
              name="business-address"
              value="123 Main St, Anytown, USA"
              placeholder="Enter business address"
            />
            <s-text-field
              label="Store phone"
              name="store-phone"
              value="+1 (555) 123-4567"
              placeholder="Enter phone number"
            />
            <s-choice-list label="Primary currency" name="currency">
              <s-choice value="usd" selected>
                US Dollar ($)
              </s-choice>
              <s-choice value="cad">Canadian Dollar (CAD)</s-choice>
              <s-choice value="eur">Euro (€)</s-choice>
            </s-choice-list>
          </s-section>

          {/* === */}
          {/* Notifications */}
          {/* === */}
          <s-section heading="Notifications">
            <s-select
              label="Notification frequency"
              name="notification-frequency"
            >
              <s-option value="immediately" selected>
                Immediately
              </s-option>
              <s-option value="hourly">Hourly digest</s-option>
              <s-option value="daily">Daily digest</s-option>
            </s-select>
            <s-choice-list
              label="Notification types"
              name="notifications-type"
              multiple
            >
              <s-choice value="new-order" selected>
                New order notifications
              </s-choice>
              <s-choice value="low-stock">Low stock alerts</s-choice>
              <s-choice value="customer-review">
                Customer review notifications
              </s-choice>
              <s-choice value="shipping-updates">Shipping updates</s-choice>
            </s-choice-list>
          </s-section>

          {/* === */}
          {/* Preferences */}
          {/* === */}
          <s-section heading="Preferences">
            <s-box border="base" borderRadius="base">
              <s-clickable
                padding="small-100"
                href="/app/settings/shipping"
                accessibilityLabel="Configure shipping methods, rates, and fulfillment options"
              >
                <s-grid
                  gridTemplateColumns="1fr auto"
                  alignItems="center"
                  gap="base"
                >
                  <s-box>
                    <s-heading>Shipping & fulfillment</s-heading>
                    <s-paragraph color="subdued">
                      Shipping methods, rates, zones, and fulfillment preferences.
                    </s-paragraph>
                  </s-box>
                  <s-icon type="chevron-right" />
                </s-grid>
              </s-clickable>
              <s-box paddingInline="small-100">
                <s-divider />
              </s-box>

              <s-clickable
                padding="small-100"
                href="/app/settings/products_catalog"
                accessibilityLabel="Configure product defaults, customer experience, and catalog settings"
              >
                <s-grid
                  gridTemplateColumns="1fr auto"
                  alignItems="center"
                  gap="base"
                >
                  <s-box>
                    <s-heading>Products & catalog</s-heading>
                    <s-paragraph color="subdued">
                      Product defaults, customer experience, and catalog display
                      options.
                    </s-paragraph>
                  </s-box>
                  <s-icon type="chevron-right" />
                </s-grid>
              </s-clickable>
              <s-box paddingInline="small-100">
                <s-divider />
              </s-box>

              <s-clickable
                padding="small-100"
                href="/app/settings/customer_support"
                accessibilityLabel="Manage customer support settings and help resources"
              >
                <s-grid
                  gridTemplateColumns="1fr auto"
                  alignItems="center"
                  gap="base"
                >
                  <s-box>
                    <s-heading>Customer support</s-heading>
                    <s-paragraph color="subdued">
                      Support settings, help resources, and customer service
                      tools.
                    </s-paragraph>
                  </s-box>
                  <s-icon type="chevron-right" />
                </s-grid>
              </s-clickable>
            </s-box>
          </s-section>

          {/* === */}
          {/* Tools */}
          {/* === */}
          <s-section heading="Tools">
            <s-stack
              gap="none"
              border="base"
              borderRadius="base"
              overflow="hidden"
            >
              <s-box padding="small-100">
                <s-grid
                  gridTemplateColumns="1fr auto"
                  alignItems="center"
                  gap="base"
                >
                  <s-box>
                    <s-heading>Reset app settings</s-heading>
                    <s-paragraph color="subdued">
                      Reset all settings to their default values. This action
                      cannot be undone.
                    </s-paragraph>
                  </s-box>
                  <s-button tone="critical">Reset</s-button>
                </s-grid>
              </s-box>
              <s-box paddingInline="small-100">
                <s-divider />
              </s-box>

              <s-box padding="small-100">
                <s-grid
                  gridTemplateColumns="1fr auto"
                  alignItems="center"
                  gap="base"
                >
                  <s-box>
                    <s-heading>Export settings</s-heading>
                    <s-paragraph color="subdued">
                      Download a backup of all your current settings.
                    </s-paragraph>
                  </s-box>
                  <s-button>Export</s-button>
                </s-grid>
              </s-box>
            </s-stack>
        </s-section>
    </s-page>
  </form>
  ```

  ##### html

  ```html
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <script src="https://cdn.shopify.com/shopifycloud/polaris.js"></script>
      <title>Pattern</title>
    </head>
    <body>
      <!-- === -->
      <!-- Settings page pattern -->
      <!-- === -->
      <form data-save-bar onSubmit="" onReset="">
        <s-page heading="Settings" inlineSize="small">
          <!-- === -->
          <!-- Store Information -->
          <!-- === -->
          <s-section heading="Store Information">
            <s-text-field
              label="Store name"
              name="store-name"
              value="Puzzlify Store"
              placeholder="Enter store name"
            ></s-text-field>
            <s-text-field
              label="Business address"
              name="business-address"
              value="123 Main St, Anytown, USA"
              placeholder="Enter business address"
            ></s-text-field>
            <s-text-field
              label="Store phone"
              name="store-phone"
              value="+1 (555) 123-4567"
              placeholder="Enter phone number"
            ></s-text-field>
            <s-choice-list label="Primary currency" name="currency">
              <s-choice value="usd" selected>US Dollar ($)</s-choice>
              <s-choice value="cad">Canadian Dollar (CAD)</s-choice>
              <s-choice value="eur">Euro (€)</s-choice>
            </s-choice-list>
          </s-section>
          <!-- === -->
          <!-- Notifications -->
          <!-- === -->
          <s-section heading="Notifications">
            <s-select
              label="Notification frequency"
              name="notification-frequency"
            >
              <s-option value="immediately" selected>Immediately</s-option>
              <s-option value="hourly">Hourly digest</s-option>
              <s-option value="daily">Daily digest</s-option>
            </s-select>
            <s-choice-list
              label="Notification types"
              name="notifications-type"
              multiple
            >
              <s-choice value="new-order" selected
                >New order notifications</s-choice
              >
              <s-choice value="low-stock">Low stock alerts</s-choice>
              <s-choice value="customer-review"
                >Customer review notifications</s-choice
              >
              <s-choice value="shipping-updates">Shipping updates</s-choice>
            </s-choice-list>
          </s-section>
          <!-- === -->
          <!-- Preferences -->
          <!-- === -->
          <s-section heading="Preferences">
            <s-box
              border="base"
              borderRadius="base"
            >
              <s-clickable
                padding="small-100"
                href="/app/settings/shipping"
                accessibilityLabel="Configure shipping methods, rates, and fulfillment options"
              >
                <s-grid
                  gridTemplateColumns="1fr auto"
                  alignItems="center"
                  gap="base"
                >
                  <s-box>
                    <s-heading>Shipping & fulfillment</s-heading>
                    <s-paragraph color="subdued">
                      Shipping methods, rates, zones, and fulfillment preferences.
                    </s-paragraph>
                  </s-box>
                  <s-icon type="chevron-right"></s-icon>
                </s-grid>
              </s-clickable>
              <s-box paddingInline="small-100">
                <s-divider></s-divider>
              </s-box>
              <s-clickable
                padding="small-100"
                href="/app/settings/products_catalog"
                accessibilityLabel="Configure product defaults, customer experience, and catalog settings"
              >
                <s-grid
                  gridTemplateColumns="1fr auto"
                  alignItems="center"
                  gap="base"
                >
                  <s-box>
                    <s-heading>Products & catalog</s-heading>
                    <s-paragraph color="subdued">
                      Product defaults, customer experience, and catalog display
                      options.
                    </s-paragraph>
                  </s-box>
                  <s-icon type="chevron-right"></s-icon>
                </s-grid>
              </s-clickable>
              <s-box paddingInline="small-100">
                <s-divider></s-divider>
              </s-box>
              <s-clickable
                padding="small-100"
                href="/app/settings/customer_support"
                accessibilityLabel="Manage customer support settings and help resources"
              >
                <s-grid
                  gridTemplateColumns="1fr auto"
                  alignItems="center"
                  gap="base"
                >
                  <s-box>
                    <s-heading>Customer support</s-heading>
                    <s-paragraph color="subdued">
                      Support settings, help resources, and customer service
                      tools.
                    </s-paragraph>
                  </s-box>
                  <s-icon type="chevron-right"></s-icon>
                </s-grid>
              </s-clickable>
            </s-box>
          </s-section>
          <!-- === -->
          <!-- Tools -->
          <!-- === -->
          <s-section heading="Tools">
            <s-stack
              gap="none"
              border="base"
              borderRadius="base"
              overflow="hidden"
            >
              <s-box padding="small-100">
                <s-grid
                  gridTemplateColumns="1fr auto"
                  alignItems="center"
                  gap="base"
                >
                  <s-box>
                    <s-heading>Reset app settings</s-heading>
                    <s-paragraph color="subdued">
                      Reset all settings to their default values. This action
                      cannot be undone.
                    </s-paragraph>
                  </s-box>
                  <s-button tone="critical">Reset</s-button>
                </s-grid>
              </s-box>
              <s-box paddingInline="small-100">
                <s-divider></s-divider>
              </s-box>
              <s-box padding="small-100">
                <s-grid
                  gridTemplateColumns="1fr auto"
                  alignItems="center"
                  gap="base"
                >
                  <s-box>
                    <s-heading>Export settings</s-heading>
                    <s-paragraph color="subdued">
                      Download a backup of all your current settings.
                    </s-paragraph>
                  </s-box>
                  <s-button>Export</s-button>
                </s-grid>
              </s-box>
            </s-stack>
          </s-section>
        </s-page>
      </form>
    </body>
  </html>
  ```

## Related

[Requirements - Built for Shopify](https://shopify.dev/docs/apps/launch/built-for-shopify/requirements)


---
title: Settings
description: >-
  Make settings pages easy to scan by grouping related information in a logical
  order. For complex or lengthy settings, organize content into distinct, themed
  sections that link to their own pages.
    | Used to | Examples |
    | --- | --- |
    | Find and change app settings | Membership settings, app appearance, set up theme blocks |

    ![Preview of the settings pattern](/images/templated-apis-screenshots/admin/patterns/settings-example.png)

    This pattern uses `Box`, `Button`, `ChoiceList`, `Clickable`, `Divider`, `Grid`, `Heading`, `Icon`, `Paragraph`, `Section`, `Select`, `Stack`, and `TextField` components.

    ---

    ## Design guidelines
    Design scannable settings pages with groups of related information placed in logical order.

    ### Navigation

    * Users must be able to return to the previous page without using the browser button. To achieve this, your app can provide breadcrumbs or a Back button on the page.
    * Offer users clear and predictable action labels.

    ---

    ### Visual design

    Design your app to be responsive and adapt to different screen sizes and devices. This ensures a seamless user experience across various platforms.

    * Use looser spacing for low-density layouts. Use tighter spacing for high-density layouts.
    * Use high-resolution photos and images to ensure a professional, high-quality experience.

    ---

    <style>
      div[class*="CodeBlock-module-CodeBlock_"] {
        max-height: calc(100vh - 80px) !important;
      }
      div[class*="Tabs-module-TabsContent_"] {
        overflow: auto !important;
      }
      div[class*="Screenshot-module-Screenshot_"] {
        display: none !important;
      }
    </style>
api_name: app-home
source_url:
  html: 'https://shopify.dev/docs/api/app-home/patterns/templates/settings'
  md: 'https://shopify.dev/docs/api/app-home/patterns/templates/settings.md'
---

# Settings

Make settings pages easy to scan by grouping related information in a logical order. For complex or lengthy settings, organize content into distinct, themed sections that link to their own pages.

| Used to | Examples |
| - | - |
| Find and change app settings | Membership settings, app appearance, set up theme blocks |

![Preview of the settings pattern](https://shopify.dev/images/templated-apis-screenshots/admin/patterns/settings-example.png)

This pattern uses `Box`, `Button`, `ChoiceList`, `Clickable`, `Divider`, `Grid`, `Heading`, `Icon`, `Paragraph`, `Section`, `Select`, `Stack`, and `TextField` components.

***

## Design guidelines

Design scannable settings pages with groups of related information placed in logical order.

### Navigation

* Users must be able to return to the previous page without using the browser button. To achieve this, your app can provide breadcrumbs or a Back button on the page.
* Offer users clear and predictable action labels.

***

### Visual design

Design your app to be responsive and adapt to different screen sizes and devices. This ensures a seamless user experience across various platforms.

* Use looser spacing for low-density layouts. Use tighter spacing for high-density layouts.
* Use high-resolution photos and images to ensure a professional, high-quality experience.

***

Examples

### Examples

* #### Settings

  ##### jsx

  ```jsx
  <form
    data-save-bar
    onSubmit={(event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      const formEntries = Object.fromEntries(formData);
      console.log("Form data", formEntries);
    }}
    onReset={(event) => {
      console.log("Handle discarded changes if necessary");
    }}
  >
        <s-page heading="Settings" inlineSize="small">
          {/* === */}
          {/* Store Information */}
          {/* === */}
          <s-section heading="Store Information">
            <s-text-field
              label="Store name"
              name="store-name"
              value="Puzzlify Store"
              placeholder="Enter store name"
            />
            <s-text-field
              label="Business address"
              name="business-address"
              value="123 Main St, Anytown, USA"
              placeholder="Enter business address"
            />
            <s-text-field
              label="Store phone"
              name="store-phone"
              value="+1 (555) 123-4567"
              placeholder="Enter phone number"
            />
            <s-choice-list label="Primary currency" name="currency">
              <s-choice value="usd" selected>
                US Dollar ($)
              </s-choice>
              <s-choice value="cad">Canadian Dollar (CAD)</s-choice>
              <s-choice value="eur">Euro (€)</s-choice>
            </s-choice-list>
          </s-section>

          {/* === */}
          {/* Notifications */}
          {/* === */}
          <s-section heading="Notifications">
            <s-select
              label="Notification frequency"
              name="notification-frequency"
            >
              <s-option value="immediately" selected>
                Immediately
              </s-option>
              <s-option value="hourly">Hourly digest</s-option>
              <s-option value="daily">Daily digest</s-option>
            </s-select>
            <s-choice-list
              label="Notification types"
              name="notifications-type"
              multiple
            >
              <s-choice value="new-order" selected>
                New order notifications
              </s-choice>
              <s-choice value="low-stock">Low stock alerts</s-choice>
              <s-choice value="customer-review">
                Customer review notifications
              </s-choice>
              <s-choice value="shipping-updates">Shipping updates</s-choice>
            </s-choice-list>
          </s-section>

          {/* === */}
          {/* Preferences */}
          {/* === */}
          <s-section heading="Preferences">
            <s-box border="base" borderRadius="base">
              <s-clickable
                padding="small-100"
                href="/app/settings/shipping"
                accessibilityLabel="Configure shipping methods, rates, and fulfillment options"
              >
                <s-grid
                  gridTemplateColumns="1fr auto"
                  alignItems="center"
                  gap="base"
                >
                  <s-box>
                    <s-heading>Shipping & fulfillment</s-heading>
                    <s-paragraph color="subdued">
                      Shipping methods, rates, zones, and fulfillment preferences.
                    </s-paragraph>
                  </s-box>
                  <s-icon type="chevron-right" />
                </s-grid>
              </s-clickable>
              <s-box paddingInline="small-100">
                <s-divider />
              </s-box>

              <s-clickable
                padding="small-100"
                href="/app/settings/products_catalog"
                accessibilityLabel="Configure product defaults, customer experience, and catalog settings"
              >
                <s-grid
                  gridTemplateColumns="1fr auto"
                  alignItems="center"
                  gap="base"
                >
                  <s-box>
                    <s-heading>Products & catalog</s-heading>
                    <s-paragraph color="subdued">
                      Product defaults, customer experience, and catalog display
                      options.
                    </s-paragraph>
                  </s-box>
                  <s-icon type="chevron-right" />
                </s-grid>
              </s-clickable>
              <s-box paddingInline="small-100">
                <s-divider />
              </s-box>

              <s-clickable
                padding="small-100"
                href="/app/settings/customer_support"
                accessibilityLabel="Manage customer support settings and help resources"
              >
                <s-grid
                  gridTemplateColumns="1fr auto"
                  alignItems="center"
                  gap="base"
                >
                  <s-box>
                    <s-heading>Customer support</s-heading>
                    <s-paragraph color="subdued">
                      Support settings, help resources, and customer service
                      tools.
                    </s-paragraph>
                  </s-box>
                  <s-icon type="chevron-right" />
                </s-grid>
              </s-clickable>
            </s-box>
          </s-section>

          {/* === */}
          {/* Tools */}
          {/* === */}
          <s-section heading="Tools">
            <s-stack
              gap="none"
              border="base"
              borderRadius="base"
              overflow="hidden"
            >
              <s-box padding="small-100">
                <s-grid
                  gridTemplateColumns="1fr auto"
                  alignItems="center"
                  gap="base"
                >
                  <s-box>
                    <s-heading>Reset app settings</s-heading>
                    <s-paragraph color="subdued">
                      Reset all settings to their default values. This action
                      cannot be undone.
                    </s-paragraph>
                  </s-box>
                  <s-button tone="critical">Reset</s-button>
                </s-grid>
              </s-box>
              <s-box paddingInline="small-100">
                <s-divider />
              </s-box>

              <s-box padding="small-100">
                <s-grid
                  gridTemplateColumns="1fr auto"
                  alignItems="center"
                  gap="base"
                >
                  <s-box>
                    <s-heading>Export settings</s-heading>
                    <s-paragraph color="subdued">
                      Download a backup of all your current settings.
                    </s-paragraph>
                  </s-box>
                  <s-button>Export</s-button>
                </s-grid>
              </s-box>
            </s-stack>
        </s-section>
    </s-page>
  </form>
  ```

  ##### html

  ```html
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <script src="https://cdn.shopify.com/shopifycloud/polaris.js"></script>
      <title>Pattern</title>
    </head>
    <body>
      <!-- === -->
      <!-- Settings page pattern -->
      <!-- === -->
      <form data-save-bar onSubmit="" onReset="">
        <s-page heading="Settings" inlineSize="small">
          <!-- === -->
          <!-- Store Information -->
          <!-- === -->
          <s-section heading="Store Information">
            <s-text-field
              label="Store name"
              name="store-name"
              value="Puzzlify Store"
              placeholder="Enter store name"
            ></s-text-field>
            <s-text-field
              label="Business address"
              name="business-address"
              value="123 Main St, Anytown, USA"
              placeholder="Enter business address"
            ></s-text-field>
            <s-text-field
              label="Store phone"
              name="store-phone"
              value="+1 (555) 123-4567"
              placeholder="Enter phone number"
            ></s-text-field>
            <s-choice-list label="Primary currency" name="currency">
              <s-choice value="usd" selected>US Dollar ($)</s-choice>
              <s-choice value="cad">Canadian Dollar (CAD)</s-choice>
              <s-choice value="eur">Euro (€)</s-choice>
            </s-choice-list>
          </s-section>
          <!-- === -->
          <!-- Notifications -->
          <!-- === -->
          <s-section heading="Notifications">
            <s-select
              label="Notification frequency"
              name="notification-frequency"
            >
              <s-option value="immediately" selected>Immediately</s-option>
              <s-option value="hourly">Hourly digest</s-option>
              <s-option value="daily">Daily digest</s-option>
            </s-select>
            <s-choice-list
              label="Notification types"
              name="notifications-type"
              multiple
            >
              <s-choice value="new-order" selected
                >New order notifications</s-choice
              >
              <s-choice value="low-stock">Low stock alerts</s-choice>
              <s-choice value="customer-review"
                >Customer review notifications</s-choice
              >
              <s-choice value="shipping-updates">Shipping updates</s-choice>
            </s-choice-list>
          </s-section>
          <!-- === -->
          <!-- Preferences -->
          <!-- === -->
          <s-section heading="Preferences">
            <s-box
              border="base"
              borderRadius="base"
            >
              <s-clickable
                padding="small-100"
                href="/app/settings/shipping"
                accessibilityLabel="Configure shipping methods, rates, and fulfillment options"
              >
                <s-grid
                  gridTemplateColumns="1fr auto"
                  alignItems="center"
                  gap="base"
                >
                  <s-box>
                    <s-heading>Shipping & fulfillment</s-heading>
                    <s-paragraph color="subdued">
                      Shipping methods, rates, zones, and fulfillment preferences.
                    </s-paragraph>
                  </s-box>
                  <s-icon type="chevron-right"></s-icon>
                </s-grid>
              </s-clickable>
              <s-box paddingInline="small-100">
                <s-divider></s-divider>
              </s-box>
              <s-clickable
                padding="small-100"
                href="/app/settings/products_catalog"
                accessibilityLabel="Configure product defaults, customer experience, and catalog settings"
              >
                <s-grid
                  gridTemplateColumns="1fr auto"
                  alignItems="center"
                  gap="base"
                >
                  <s-box>
                    <s-heading>Products & catalog</s-heading>
                    <s-paragraph color="subdued">
                      Product defaults, customer experience, and catalog display
                      options.
                    </s-paragraph>
                  </s-box>
                  <s-icon type="chevron-right"></s-icon>
                </s-grid>
              </s-clickable>
              <s-box paddingInline="small-100">
                <s-divider></s-divider>
              </s-box>
              <s-clickable
                padding="small-100"
                href="/app/settings/customer_support"
                accessibilityLabel="Manage customer support settings and help resources"
              >
                <s-grid
                  gridTemplateColumns="1fr auto"
                  alignItems="center"
                  gap="base"
                >
                  <s-box>
                    <s-heading>Customer support</s-heading>
                    <s-paragraph color="subdued">
                      Support settings, help resources, and customer service
                      tools.
                    </s-paragraph>
                  </s-box>
                  <s-icon type="chevron-right"></s-icon>
                </s-grid>
              </s-clickable>
            </s-box>
          </s-section>
          <!-- === -->
          <!-- Tools -->
          <!-- === -->
          <s-section heading="Tools">
            <s-stack
              gap="none"
              border="base"
              borderRadius="base"
              overflow="hidden"
            >
              <s-box padding="small-100">
                <s-grid
                  gridTemplateColumns="1fr auto"
                  alignItems="center"
                  gap="base"
                >
                  <s-box>
                    <s-heading>Reset app settings</s-heading>
                    <s-paragraph color="subdued">
                      Reset all settings to their default values. This action
                      cannot be undone.
                    </s-paragraph>
                  </s-box>
                  <s-button tone="critical">Reset</s-button>
                </s-grid>
              </s-box>
              <s-box paddingInline="small-100">
                <s-divider></s-divider>
              </s-box>
              <s-box padding="small-100">
                <s-grid
                  gridTemplateColumns="1fr auto"
                  alignItems="center"
                  gap="base"
                >
                  <s-box>
                    <s-heading>Export settings</s-heading>
                    <s-paragraph color="subdued">
                      Download a backup of all your current settings.
                    </s-paragraph>
                  </s-box>
                  <s-button>Export</s-button>
                </s-grid>
              </s-box>
            </s-stack>
          </s-section>
        </s-page>
      </form>
    </body>
  </html>
  ```

## Related

[Requirements - Built for Shopify](https://shopify.dev/docs/apps/launch/built-for-shopify/requirements)



---
title: Account connection
description: >
  The account connection component is used so merchants can connect or
  disconnect their store to various accounts. For example, if merchants want to
  use the Facebook sales channel, they need to connect their Facebook account to
  their Shopify store.

    | Used to | Examples |
    | --- | --- |
    | Display connection status | Show if a sales channel is connected or disconnected |
    | Allow merchants to disconnect accounts  | Enable merchants to disconnect from a marketing platform |

    ---
    

    
api_name: app-home
source_url:
  html: >-
    https://shopify.dev/docs/api/app-home/patterns/compositions/account-connection
  md: >-
    https://shopify.dev/docs/api/app-home/patterns/compositions/account-connection.md
---

# Account connection

The account connection component is used so merchants can connect or disconnect their store to various accounts. For example, if merchants want to use the Facebook sales channel, they need to connect their Facebook account to their Shopify store.

| Used to | Examples |
| - | - |
| Display connection status | Show if a sales channel is connected or disconnected |
| Allow merchants to disconnect accounts | Enable merchants to disconnect from a marketing platform |

***

Examples

### Examples

* #### Account connection

  ##### jsx

  ```jsx
  <s-section>
    <s-stack gap="base">
      <s-grid gridTemplateColumns="1fr auto" gap="base" alignItems="center">
        <s-grid-item>
          <s-stack>
            <s-heading>Puzzlify</s-heading>
            <s-text color="subdued">No account connected</s-text>
          </s-stack>
        </s-grid-item>
        <s-grid-item>
          <s-button variant="primary">Connect</s-button>
        </s-grid-item>
      </s-grid>
      <s-text>
        By clicking Connect, you agree to accept Sample App's terms and
        conditions. You'll pay a commission rate of 15% on sales made through
        Sample App.
      </s-text>
    </s-stack>
  </s-section>
  ```

  ##### html

  ```html
  <s-section>
    <s-stack gap="base">
    <s-grid gridTemplateColumns="1fr auto" gap="base" alignItems="center">
      <s-grid-item>
        <s-stack>
          <s-heading>Puzzlify</s-heading>
          <s-text color="subdued">No account connected</s-text>
        </s-stack>
      </s-grid-item>
      <s-grid-item>
        <s-button variant="primary">Connect</s-button>
      </s-grid-item>
    </s-grid>
    <s-text>By clicking Connect, you agree to accept Sample App's terms and conditions. You'll pay a commission rate of 15% on sales made through Sample App.</s-text>
  </s-stack>
  </s-section>
  ```

## Related

[Requirements - Built for Shopify](https://shopify.dev/docs/apps/launch/built-for-shopify/requirements)



---
title: Resource list
description: >
  A resource list displays a collection of objects of the same type, like
  products or customers. The main job of a resource list is to help merchants
  find an object and navigate to a full-page representation of it.

  .

    | Used to | Examples |
    | --- | --- |
    | Display collections of similar resources |  Campaigns, subscribers, social posts, templates|
    | Help merchants find and select items  | Search subscribers by email; Filter campaigns by status |
    | Perform bulk actions on selected items  | Tag subscribers; Archive campaigns; Publish selected posts |

    ---
    

    
api_name: app-home
source_url:
  html: 'https://shopify.dev/docs/api/app-home/patterns/compositions/resource-list'
  md: 'https://shopify.dev/docs/api/app-home/patterns/compositions/resource-list.md'
---

# Resource list

A resource list displays a collection of objects of the same type, like products or customers. The main job of a resource list is to help merchants find an object and navigate to a full-page representation of it. .

| Used to | Examples |
| - | - |
| Display collections of similar resources | Campaigns, subscribers, social posts, templates |
| Help merchants find and select items | Search subscribers by email; Filter campaigns by status |
| Perform bulk actions on selected items | Tag subscribers; Archive campaigns; Publish selected posts |

***

Examples

### Examples

* #### Resource list

  ##### jsx

  ```jsx
  <s-section padding="none">
    <s-stack gap="small-200">
      <s-grid gridTemplateColumns="1fr auto" gap="base" alignItems="center" paddingInline="base" paddingBlockStart="base">
        <s-grid gridTemplateColumns="1fr auto" gap="small-200" alignItems="center">
          <s-text-field icon="search" placeholder="Filter customers"></s-text-field>
          <s-button commandFor="tagged-with">Tagged with</s-button>
          <s-popover id="tagged-with">
            <s-stack gap="small-200" padding="small-200">
              <s-text-field value="VIP" placeholder="Add tag"></s-text-field>
              <s-link href="">Clear</s-link>
            </s-stack>
          </s-popover>
        </s-grid>
        <s-button variant="secondary">Save</s-button>
      </s-grid>

      <s-stack direction="inline"  gap="small-400" paddingInline="base">
        <s-clickable-chip removable>Tagged with VIP</s-clickable-chip>
      </s-stack>
      
      <s-grid gridTemplateColumns="1fr auto" gap="base" alignItems="center" paddingInline="base">
        <s-checkbox label="Showing 2 customers"></s-checkbox>
        <s-select>
          <s-option value="newest">Newest update</s-option>
          <s-option value="oldest">Oldest update</s-option>
        </s-select>
      </s-grid>
      
      <s-stack>
        <s-clickable borderStyle="solid none none none" border="base" paddingInline="base" paddingBlock="small">
          <s-grid gridTemplateColumns="1fr auto" gap="base" alignItems="center">
            <s-stack direction="inline" gap="small" alignItems="center">
              <s-checkbox></s-checkbox>
              <s-avatar></s-avatar>
              <s-stack>
                <s-heading>Mae Jemison</s-heading>
                <s-text>Decatur, USA</s-text>
              </s-stack>
            </s-stack>
            <s-button icon="menu-horizontal" variant="tertiary" accessibilityLabel="Actions for Mae Jemison"></s-button>
          </s-grid>
        </s-clickable>
        <s-clickable borderStyle="solid none none none" border="base" paddingInline="base" paddingBlock="small">
          <s-grid gridTemplateColumns="1fr auto" gap="base" alignItems="center">
            <s-stack direction="inline" gap="small" alignItems="center">
              <s-checkbox></s-checkbox>
              <s-avatar></s-avatar>
              <s-stack>
                <s-heading>Ellen Ochoa</s-heading>
                <s-text>Los Angeles, USA</s-text>
              </s-stack>
            </s-stack>
            <s-button icon="menu-horizontal" variant="tertiary" accessibilityLabel="Actions for Ellen Ochoa"></s-button>
          </s-grid>
        </s-clickable>
      </s-stack>
    </s-stack>
  </s-section>
  ```

  ##### html

  ```html
  <s-section padding="none">
    <s-stack gap="small-200">
      <s-grid gridTemplateColumns="1fr auto" gap="base" alignItems="center" paddingInline="base" paddingBlockStart="base">
        <s-grid gridTemplateColumns="1fr auto" gap="small-200" alignItems="center">
          <s-text-field icon="search" placeholder="Filter customers"></s-text-field>
          <s-button commandFor="tagged-with">Tagged with</s-button>
          <s-popover id="tagged-with">
            <s-stack gap="small-200" padding="small-200">
              <s-text-field value="VIP" placeholder="Add tag"></s-text-field>
              <s-link href="">Clear</s-link>
            </s-stack>
          </s-popover>
        </s-grid>
        <s-button variant="secondary">Save</s-button>
      </s-grid>

      <s-stack direction="inline"  gap="small-400" paddingInline="base">
        <s-clickable-chip removable>Tagged with VIP</s-clickable-chip>
      </s-stack>
      
      <s-grid gridTemplateColumns="1fr auto" gap="base" alignItems="center" paddingInline="base">
        <s-checkbox label="Showing 2 customers"></s-checkbox>
        <s-select>
          <s-option value="newest">Newest update</s-option>
          <s-option value="oldest">Oldest update</s-option>
        </s-select>
      </s-grid>
      
      <s-stack>
        <s-clickable borderStyle="solid none none none" border="base" paddingInline="base" paddingBlock="small">
          <s-grid gridTemplateColumns="1fr auto" gap="base" alignItems="center">
            <s-stack direction="inline" gap="small" alignItems="center">
              <s-checkbox></s-checkbox>
              <s-avatar></s-avatar>
              <s-stack>
                <s-heading>Mae Jemison</s-heading>
                <s-text>Decatur, USA</s-text>
              </s-stack>
            </s-stack>
            <s-button icon="menu-horizontal" variant="tertiary" accessibilityLabel="Actions for Mae Jemison"></s-button>
          </s-grid>
        </s-clickable>
        <s-clickable borderStyle="solid none none none" border="base" paddingInline="base" paddingBlock="small">
          <s-grid gridTemplateColumns="1fr auto" gap="base" alignItems="center">
            <s-stack direction="inline" gap="small" alignItems="center">
              <s-checkbox></s-checkbox>
              <s-avatar></s-avatar>
              <s-stack>
                <s-heading>Ellen Ochoa</s-heading>
                <s-text>Los Angeles, USA</s-text>
              </s-stack>
            </s-stack>
            <s-button icon="menu-horizontal" variant="tertiary" accessibilityLabel="Actions for Ellen Ochoa"></s-button>
          </s-grid>
        </s-clickable>
      </s-stack>
    </s-stack>
  </s-section>
  ```

## Related

[Requirements - Built for Shopify](https://shopify.dev/docs/apps/launch/built-for-shopify/requirements)


---
title: Media card
description: >
  Media cards provide a consistent layout to present visual information to
  merchants. Visual media is used to provide additional context to the written
  information it's paired with.

    | Used to | Examples |
    | --- | --- |
    | Educate merchants on key actions | Show how to connect a social account with a demo image |
    | Provide clear calls to action | Show campaign preview with a "Send campaign" button |

    ---
    

    
api_name: app-home
source_url:
  html: 'https://shopify.dev/docs/api/app-home/patterns/compositions/media-card'
  md: 'https://shopify.dev/docs/api/app-home/patterns/compositions/media-card.md'
---

# Media card

Media cards provide a consistent layout to present visual information to merchants. Visual media is used to provide additional context to the written information it's paired with.

| Used to | Examples |
| - | - |
| Educate merchants on key actions | Show how to connect a social account with a demo image |
| Provide clear calls to action | Show campaign preview with a "Send campaign" button |

***

Examples

### Examples

* #### Media card

  ##### jsx

  ```jsx
  <s-box
    border="base"
    borderRadius="base"
    overflow="hidden"
    maxInlineSize="216px"
  >
    <s-clickable href="">
      <s-image
        aspectRatio="1/1"
        objectFit="cover"
        alt="Illustration of characters with a 4-piece puzzle"
        src="https://cdn.shopify.com/static/images/polaris/patterns/4-pieces.png"
       />
    </s-clickable>
    <s-divider />
    <s-grid
      gridTemplateColumns="1fr auto"
      background="base"
      padding="small"
      gap="small"
      alignItems="center"
    >
      <s-heading>4-Pieces</s-heading>
      <s-button href="" accessibilityLabel="View 4-pieces puzzle template">
        View
      </s-button>
    </s-grid>
  </s-box>
  ```

  ##### html

  ```html
  <s-box border="base" borderRadius="base" overflow="hidden" maxInlineSize="216px">
    <s-clickable href="">
      <s-image
        aspectRatio="1/1"
        objectFit="cover"
        alt="Illustration of characters with a 4-piece puzzle"
        src="https://cdn.shopify.com/static/images/polaris/patterns/4-pieces.png"
      ></s-image>
    </s-clickable>
    <s-divider></s-divider>
    <s-grid
      gridTemplateColumns="1fr auto"
      background="base"
      padding="small"
      gap="small"
      alignItems="center"
    >
      <s-heading>4-Pieces</s-heading>
      <s-button href="" accessibilityLabel="View 4-pieces puzzle template">
        View
      </s-button>
    </s-grid>
  </s-box>
  ```

## Related

[Requirements - Built for Shopify](https://shopify.dev/docs/apps/launch/built-for-shopify/requirements)


---
title: Account connection
description: >
  The account connection component is used so merchants can connect or
  disconnect their store to various accounts. For example, if merchants want to
  use the Facebook sales channel, they need to connect their Facebook account to
  their Shopify store.

    | Used to | Examples |
    | --- | --- |
    | Display connection status | Show if a sales channel is connected or disconnected |
    | Allow merchants to disconnect accounts  | Enable merchants to disconnect from a marketing platform |

    ---
    

    
api_name: app-home
source_url:
  html: >-
    https://shopify.dev/docs/api/app-home/patterns/compositions/account-connection
  md: >-
    https://shopify.dev/docs/api/app-home/patterns/compositions/account-connection.md
---

# Account connection

The account connection component is used so merchants can connect or disconnect their store to various accounts. For example, if merchants want to use the Facebook sales channel, they need to connect their Facebook account to their Shopify store.

| Used to | Examples |
| - | - |
| Display connection status | Show if a sales channel is connected or disconnected |
| Allow merchants to disconnect accounts | Enable merchants to disconnect from a marketing platform |

***

Examples

### Examples

* #### Account connection

  ##### jsx

  ```jsx
  <s-section>
    <s-stack gap="base">
      <s-grid gridTemplateColumns="1fr auto" gap="base" alignItems="center">
        <s-grid-item>
          <s-stack>
            <s-heading>Puzzlify</s-heading>
            <s-text color="subdued">No account connected</s-text>
          </s-stack>
        </s-grid-item>
        <s-grid-item>
          <s-button variant="primary">Connect</s-button>
        </s-grid-item>
      </s-grid>
      <s-text>
        By clicking Connect, you agree to accept Sample App's terms and
        conditions. You'll pay a commission rate of 15% on sales made through
        Sample App.
      </s-text>
    </s-stack>
  </s-section>
  ```

  ##### html

  ```html
  <s-section>
    <s-stack gap="base">
    <s-grid gridTemplateColumns="1fr auto" gap="base" alignItems="center">
      <s-grid-item>
        <s-stack>
          <s-heading>Puzzlify</s-heading>
          <s-text color="subdued">No account connected</s-text>
        </s-stack>
      </s-grid-item>
      <s-grid-item>
        <s-button variant="primary">Connect</s-button>
      </s-grid-item>
    </s-grid>
    <s-text>By clicking Connect, you agree to accept Sample App's terms and conditions. You'll pay a commission rate of 15% on sales made through Sample App.</s-text>
  </s-stack>
  </s-section>
  ```

## Related

[Requirements - Built for Shopify](https://shopify.dev/docs/apps/launch/built-for-shopify/requirements)



---
title: Account connection
description: >
  The account connection component is used so merchants can connect or
  disconnect their store to various accounts. For example, if merchants want to
  use the Facebook sales channel, they need to connect their Facebook account to
  their Shopify store.

    | Used to | Examples |
    | --- | --- |
    | Display connection status | Show if a sales channel is connected or disconnected |
    | Allow merchants to disconnect accounts  | Enable merchants to disconnect from a marketing platform |

    ---
    

    
api_name: app-home
source_url:
  html: >-
    https://shopify.dev/docs/api/app-home/patterns/compositions/account-connection
  md: >-
    https://shopify.dev/docs/api/app-home/patterns/compositions/account-connection.md
---

# Account connection

The account connection component is used so merchants can connect or disconnect their store to various accounts. For example, if merchants want to use the Facebook sales channel, they need to connect their Facebook account to their Shopify store.

| Used to | Examples |
| - | - |
| Display connection status | Show if a sales channel is connected or disconnected |
| Allow merchants to disconnect accounts | Enable merchants to disconnect from a marketing platform |

***

Examples

### Examples

* #### Account connection

  ##### jsx

  ```jsx
  <s-section>
    <s-stack gap="base">
      <s-grid gridTemplateColumns="1fr auto" gap="base" alignItems="center">
        <s-grid-item>
          <s-stack>
            <s-heading>Puzzlify</s-heading>
            <s-text color="subdued">No account connected</s-text>
          </s-stack>
        </s-grid-item>
        <s-grid-item>
          <s-button variant="primary">Connect</s-button>
        </s-grid-item>
      </s-grid>
      <s-text>
        By clicking Connect, you agree to accept Sample App's terms and
        conditions. You'll pay a commission rate of 15% on sales made through
        Sample App.
      </s-text>
    </s-stack>
  </s-section>
  ```

  ##### html

  ```html
  <s-section>
    <s-stack gap="base">
    <s-grid gridTemplateColumns="1fr auto" gap="base" alignItems="center">
      <s-grid-item>
        <s-stack>
          <s-heading>Puzzlify</s-heading>
          <s-text color="subdued">No account connected</s-text>
        </s-stack>
      </s-grid-item>
      <s-grid-item>
        <s-button variant="primary">Connect</s-button>
      </s-grid-item>
    </s-grid>
    <s-text>By clicking Connect, you agree to accept Sample App's terms and conditions. You'll pay a commission rate of 15% on sales made through Sample App.</s-text>
  </s-stack>
  </s-section>
  ```

## Related

[Requirements - Built for Shopify](https://shopify.dev/docs/apps/launch/built-for-shopify/requirements)


---
title: Account connection
description: >
  The account connection component is used so merchants can connect or
  disconnect their store to various accounts. For example, if merchants want to
  use the Facebook sales channel, they need to connect their Facebook account to
  their Shopify store.

    | Used to | Examples |
    | --- | --- |
    | Display connection status | Show if a sales channel is connected or disconnected |
    | Allow merchants to disconnect accounts  | Enable merchants to disconnect from a marketing platform |

    ---
    

    
api_name: app-home
source_url:
  html: >-
    https://shopify.dev/docs/api/app-home/patterns/compositions/account-connection
  md: >-
    https://shopify.dev/docs/api/app-home/patterns/compositions/account-connection.md
---

# Account connection

The account connection component is used so merchants can connect or disconnect their store to various accounts. For example, if merchants want to use the Facebook sales channel, they need to connect their Facebook account to their Shopify store.

| Used to | Examples |
| - | - |
| Display connection status | Show if a sales channel is connected or disconnected |
| Allow merchants to disconnect accounts | Enable merchants to disconnect from a marketing platform |

***

Examples

### Examples

* #### Account connection

  ##### jsx

  ```jsx
  <s-section>
    <s-stack gap="base">
      <s-grid gridTemplateColumns="1fr auto" gap="base" alignItems="center">
        <s-grid-item>
          <s-stack>
            <s-heading>Puzzlify</s-heading>
            <s-text color="subdued">No account connected</s-text>
          </s-stack>
        </s-grid-item>
        <s-grid-item>
          <s-button variant="primary">Connect</s-button>
        </s-grid-item>
      </s-grid>
      <s-text>
        By clicking Connect, you agree to accept Sample App's terms and
        conditions. You'll pay a commission rate of 15% on sales made through
        Sample App.
      </s-text>
    </s-stack>
  </s-section>
  ```

  ##### html

  ```html
  <s-section>
    <s-stack gap="base">
    <s-grid gridTemplateColumns="1fr auto" gap="base" alignItems="center">
      <s-grid-item>
        <s-stack>
          <s-heading>Puzzlify</s-heading>
          <s-text color="subdued">No account connected</s-text>
        </s-stack>
      </s-grid-item>
      <s-grid-item>
        <s-button variant="primary">Connect</s-button>
      </s-grid-item>
    </s-grid>
    <s-text>By clicking Connect, you agree to accept Sample App's terms and conditions. You'll pay a commission rate of 15% on sales made through Sample App.</s-text>
  </s-stack>
  </s-section>
  ```

## Related

[Requirements - Built for Shopify](https://shopify.dev/docs/apps/launch/built-for-shopify/requirements)


---
title: Account connection
description: >
  The account connection component is used so merchants can connect or
  disconnect their store to various accounts. For example, if merchants want to
  use the Facebook sales channel, they need to connect their Facebook account to
  their Shopify store.

    | Used to | Examples |
    | --- | --- |
    | Display connection status | Show if a sales channel is connected or disconnected |
    | Allow merchants to disconnect accounts  | Enable merchants to disconnect from a marketing platform |

    ---
    

    
api_name: app-home
source_url:
  html: >-
    https://shopify.dev/docs/api/app-home/patterns/compositions/account-connection
  md: >-
    https://shopify.dev/docs/api/app-home/patterns/compositions/account-connection.md
---

# Account connection

The account connection component is used so merchants can connect or disconnect their store to various accounts. For example, if merchants want to use the Facebook sales channel, they need to connect their Facebook account to their Shopify store.

| Used to | Examples |
| - | - |
| Display connection status | Show if a sales channel is connected or disconnected |
| Allow merchants to disconnect accounts | Enable merchants to disconnect from a marketing platform |

***

Examples

### Examples

* #### Account connection

  ##### jsx

  ```jsx
  <s-section>
    <s-stack gap="base">
      <s-grid gridTemplateColumns="1fr auto" gap="base" alignItems="center">
        <s-grid-item>
          <s-stack>
            <s-heading>Puzzlify</s-heading>
            <s-text color="subdued">No account connected</s-text>
          </s-stack>
        </s-grid-item>
        <s-grid-item>
          <s-button variant="primary">Connect</s-button>
        </s-grid-item>
      </s-grid>
      <s-text>
        By clicking Connect, you agree to accept Sample App's terms and
        conditions. You'll pay a commission rate of 15% on sales made through
        Sample App.
      </s-text>
    </s-stack>
  </s-section>
  ```

  ##### html

  ```html
  <s-section>
    <s-stack gap="base">
    <s-grid gridTemplateColumns="1fr auto" gap="base" alignItems="center">
      <s-grid-item>
        <s-stack>
          <s-heading>Puzzlify</s-heading>
          <s-text color="subdued">No account connected</s-text>
        </s-stack>
      </s-grid-item>
      <s-grid-item>
        <s-button variant="primary">Connect</s-button>
      </s-grid-item>
    </s-grid>
    <s-text>By clicking Connect, you agree to accept Sample App's terms and conditions. You'll pay a commission rate of 15% on sales made through Sample App.</s-text>
  </s-stack>
  </s-section>
  ```

## Related

[Requirements - Built for Shopify](https://shopify.dev/docs/apps/launch/built-for-shopify/requirements)


---
title: Account connection
description: >
  The account connection component is used so merchants can connect or
  disconnect their store to various accounts. For example, if merchants want to
  use the Facebook sales channel, they need to connect their Facebook account to
  their Shopify store.

    | Used to | Examples |
    | --- | --- |
    | Display connection status | Show if a sales channel is connected or disconnected |
    | Allow merchants to disconnect accounts  | Enable merchants to disconnect from a marketing platform |

    ---
    

    
api_name: app-home
source_url:
  html: >-
    https://shopify.dev/docs/api/app-home/patterns/compositions/account-connection
  md: >-
    https://shopify.dev/docs/api/app-home/patterns/compositions/account-connection.md
---

# Account connection

The account connection component is used so merchants can connect or disconnect their store to various accounts. For example, if merchants want to use the Facebook sales channel, they need to connect their Facebook account to their Shopify store.

| Used to | Examples |
| - | - |
| Display connection status | Show if a sales channel is connected or disconnected |
| Allow merchants to disconnect accounts | Enable merchants to disconnect from a marketing platform |

***

Examples

### Examples

* #### Account connection

  ##### jsx

  ```jsx
  <s-section>
    <s-stack gap="base">
      <s-grid gridTemplateColumns="1fr auto" gap="base" alignItems="center">
        <s-grid-item>
          <s-stack>
            <s-heading>Puzzlify</s-heading>
            <s-text color="subdued">No account connected</s-text>
          </s-stack>
        </s-grid-item>
        <s-grid-item>
          <s-button variant="primary">Connect</s-button>
        </s-grid-item>
      </s-grid>
      <s-text>
        By clicking Connect, you agree to accept Sample App's terms and
        conditions. You'll pay a commission rate of 15% on sales made through
        Sample App.
      </s-text>
    </s-stack>
  </s-section>
  ```

  ##### html

  ```html
  <s-section>
    <s-stack gap="base">
    <s-grid gridTemplateColumns="1fr auto" gap="base" alignItems="center">
      <s-grid-item>
        <s-stack>
          <s-heading>Puzzlify</s-heading>
          <s-text color="subdued">No account connected</s-text>
        </s-stack>
      </s-grid-item>
      <s-grid-item>
        <s-button variant="primary">Connect</s-button>
      </s-grid-item>
    </s-grid>
    <s-text>By clicking Connect, you agree to accept Sample App's terms and conditions. You'll pay a commission rate of 15% on sales made through Sample App.</s-text>
  </s-stack>
  </s-section>
  ```

## Related

[Requirements - Built for Shopify](https://shopify.dev/docs/apps/launch/built-for-shopify/requirements)

---
title: Title bar
description: >-
  The admin title bar is a critical part of the Shopify Admin experience. It
  provides a way to display the current page title and actions for the user to
  take. This guide will show you how to work with the admin title bar using the
  App Bridge UI library.
api_name: app-home
source_url:
  html: 'https://shopify.dev/docs/api/app-home/app-bridge-web-components/title-bar'
  md: 'https://shopify.dev/docs/api/app-home/app-bridge-web-components/title-bar.md'
---

# Title bar

The admin title bar is a critical part of the Shopify Admin experience. It provides a way to display the current page title and actions for the user to take. This guide will show you how to work with the admin title bar using the App Bridge UI library.

## Use the s-page component

The `s-page` component is available for use in your app. It configures the title bar in the Shopify admin in addition to managing the page layout. Note that you do not need the full App Bridge UI library to use this component. You can still use `s-page` (and its required child components) in your app.

* children

  SPageChildren

* heading

  string

### SPageChildren

* breadcrumbActions

  ```ts
  HTMLElement
  ```

* primaryAction

  ```ts
  HTMLElement
  ```

* secondaryActions

  ```ts
  HTMLElement[]
  ```

```ts
interface SPageChildren {
  primaryAction?: HTMLElement;
  secondaryActions?: HTMLElement[];
  breadcrumbActions?: HTMLElement;
}
```

Examples

## Preview

![](https://shopify.dev/images/templated-apis-screenshots/admin/app-bridge-web-components/title-bar-app-home.png)

### Examples

* #### Simple s-page component

  ##### Default

  ```html
  <s-page heading="Page Title">
    <s-button slot="primary-action" onclick="shopify.toast.show('Save')">Save</s-button>
    <s-button slot="secondary-actions" onclick="shopify.toast.show('Close')">Close</s-button>
    <s-button slot="secondary-actions" onclick="shopify.toast.show('Cancel')">Cancel</s-button>
  </s-page>
  ```

* #### Simple s-page component

  ##### Description

  The \`s-page\` component accepts the following properties: - \`heading\`: The heading for the page. This is the title of the page. And the following slots: - \`primary-action\`: The primary action for the page. This is the main action for the page. - \`secondary-actions\`: The secondary actions for the page. This is a group of actions that are related to the page. - \`breadcrumb-actions\`: The breadcrumb actions for the page. This is a link to the home page or the previous page.

  ##### Default

  ```html
  <s-page heading="Page Title">
    <s-button slot="primary-action" onclick="shopify.toast.show('Save')">Save</s-button>
    <s-button slot="secondary-actions" onclick="shopify.toast.show('Close')">Close</s-button>
    <s-button slot="secondary-actions" onclick="shopify.toast.show('Cancel')">Cancel</s-button>
  </s-page>
  ```

* #### Grouped secondary actions

  ##### Description

  You can group secondary actions together using \`s-menu\` and the \`commandfor\` attribute. This will create a dropdown menu with the actions. The text content of the \`s-button\` used with the \`commandfor\` attribute will display a label for the group of actions.

  ##### Default

  ```html
  <s-page heading="Page Title">
    <s-button slot="primary-action" onclick="shopify.toast.show('Save')">Save</s-button>
    <s-button slot="secondary-actions" commandfor="more-actions-id">More actions</s-button>
    <s-menu id="more-actions-id">
      <s-button onclick="shopify.toast.show('Action 1')">Action 1</s-button>
      <s-button onclick="shopify.toast.show('Action 2')">Action 2</s-button>
      <s-button onclick="shopify.toast.show('Action 3')">Action 3</s-button>
    </s-menu>
  </s-page>
  ```

* #### Breadcrumb actions

  ##### Description

  You can add breadcrumb actions using the \`breadcrumb-actions\` slot. This will add a link to the breadcrumb actions. You can use this to add a link to the home page or to add a link to the previous page.

  ##### Default

  ```html
  <s-page heading="Page Title">
    <s-button slot="primary-action" onclick="shopify.toast.show('Save')">Save</s-button>
    <s-button slot="secondary-actions" onclick="shopify.toast.show('Cancel')">Cancel</s-button>
    <s-link slot="breadcrumb-actions" href="/">Home</s-link>
  </s-page>
  ```

* #### Complete example

  ##### Description

  Here is a complete example of how to use the \`s-page\` component to interact with the admin title bar.

  ##### Default

  ```html
  <s-page heading="Page Title">
    <s-button slot="primary-action" onclick="shopify.toast.show('Save')">Save</s-button>
    <s-button slot="secondary-actions" onclick="shopify.toast.show('Close')">Close</s-button>
    <s-button slot="secondary-actions" commandfor="more-actions-id">More actions</s-button>
    <s-menu id="more-actions-id">
      <s-button onclick="shopify.toast.show('Action 1')">Action 1</s-button>
      <s-button onclick="shopify.toast.show('Action 2')">Action 2</s-button>
      <s-button onclick="shopify.toast.show('Action 3')">Action 3</s-button>
    </s-menu>
    <s-link slot="breadcrumb-actions" href="/">Home</s-link>
  </s-page>
  ```

## Related

[Component - App Window](https://shopify.dev/docs/api/app-home/apis/app-window)


---
title: Modal
description: >-
  Displays content in an overlay. Use to create a distraction-free experience
  such as a confirmation dialog or a settings panel.
api_name: app-home
source_url:
  html: 'https://shopify.dev/docs/api/app-home/polaris-web-components/overlays/modal'
  md: >-
    https://shopify.dev/docs/api/app-home/polaris-web-components/overlays/modal.md
---

# Modal

Displays content in an overlay. Use to create a distraction-free experience such as a confirmation dialog or a settings panel.

## Properties

* accessibilityLabel

  string

  A label that describes the purpose of the modal. When set, it will be announced to users using assistive technologies and will provide them with more context.

  This overrides the `heading` prop for screen readers.

* heading

  string

  A title that describes the content of the Modal.

* hideOverlay

  () => void

  Method to hide an overlay.

* padding

  "base" | "none"

  Default: 'base'

  Adjust the padding around the Modal content.

  `base`: applies padding that is appropriate for the element.

  `none`: removes all padding from the element. This can be useful when elements inside the Modal need to span to the edge of the Modal. For example, a full-width image. In this case, rely on `Box` with a padding of 'base' to bring back the desired padding for the rest of the content.

* showOverlay

  () => void

  Method to show an overlay.

* size

  "small" | "small-100" | "base" | "large" | "large-100"

  Default: 'base'

  Adjust the size of the Modal.

* toggleOverlay

  () => void

  Method to toggle the visiblity of an overlay.

## Events

Learn more about [registering events](https://shopify.dev/docs/api/app-home/using-polaris-components#event-handling).

* afterhide

  CallbackEventListener\<typeof tagName> | null

* aftershow

  CallbackEventListener\<typeof tagName> | null

* hide

  CallbackEventListener\<typeof tagName> | null

* show

  CallbackEventListener\<typeof tagName> | null

### CallbackEventListener

```ts
(EventListener & {
      (event: CallbackEvent<T>): void;
    }) | null
```

### CallbackEvent

```ts
Event & {
  currentTarget: HTMLElementTagNameMap[T];
}
```

## Slots

* children

  HTMLElement

  The content of the Modal.

* primary-action

  HTMLElement

  The primary action to perform.

  Only a `Button` with a variant of `primary` is allowed.

* secondary-actions

  HTMLElement

  The secondary actions to perform.

  Only `Button` elements with a variant of `secondary` or `auto` are allowed.

Examples

### Examples

* #### Code

  ##### jsx

  ```jsx
  <>
    <s-button commandFor="modal">Open</s-button>

    <s-modal id="modal" heading="Details">
      <s-paragraph>Displaying more details here.</s-paragraph>

      <s-button slot="secondary-actions" commandFor="modal" command="--hide">
        Close
      </s-button>
      <s-button
        slot="primary-action"
        variant="primary"
        commandFor="modal"
        command="--hide"
      >
        Save
      </s-button>
    </s-modal>
  </>
  ```

  ##### html

  ```html
  <s-button commandFor="modal">Open</s-button>

  <s-modal id="modal" heading="Details">
    <s-paragraph>Displaying more details here.</s-paragraph>

    <s-button slot="secondary-actions" commandFor="modal" command="--hide">
      Close
    </s-button>
    <s-button
      slot="primary-action"
      variant="primary"
      commandFor="modal"
      command="--hide"
    >
      Save
    </s-button>
  </s-modal>
  ```

* #### Basic modal

  ##### Description

  Simple modal with heading and basic content for displaying information. Click the button to open the modal.

  ##### jsx

  ```jsx
  <>
    <s-button commandFor="info-modal" command="--show">
      Show product info
    </s-button>

    <s-modal id="info-modal" heading="Product information">
      <s-text>
        This product is currently out of stock and cannot be ordered.
      </s-text>

      <s-button slot="secondary-actions" commandFor="info-modal" command="--hide">
        Close
      </s-button>
    </s-modal>
  </>
  ```

  ##### html

  ```html
  <s-button commandFor="info-modal" command="--show">Show product info</s-button>

  <s-modal id="info-modal" heading="Product information">
    <s-text>This product is currently out of stock and cannot be ordered.</s-text>

    <s-button slot="secondary-actions" commandFor="info-modal" command="--hide">
      Close
    </s-button>
  </s-modal>
  ```

* #### Modal with actions

  ##### Description

  Modal with primary and secondary action buttons. Click the button to open the confirmation modal.

  ##### jsx

  ```jsx
  <s-stack gap="base">
    <s-button tone="critical" commandFor="delete-modal" command="--show">
      Delete product
    </s-button>

    <s-modal id="delete-modal" heading="Delete product?">
      <s-stack gap="base">
        <s-text>Are you sure you want to delete "Winter jacket"?</s-text>
        <s-text tone="caution">This action cannot be undone.</s-text>
      </s-stack>

      <s-button
        slot="primary-action"
        variant="primary"
        tone="critical"
        commandFor="delete-modal"
        command="--hide"
      >
        Delete product
      </s-button>
      <s-button
        slot="secondary-actions"
        variant="secondary"
        commandFor="delete-modal"
        command="--hide"
      >
        Cancel
      </s-button>
    </s-modal>
  </s-stack>
  ```

  ##### html

  ```html
  <s-stack gap="base">
    <s-button tone="critical" commandFor="delete-modal" command="--show">
      Delete product
    </s-button>

    <s-modal id="delete-modal" heading="Delete product?">
      <s-stack gap="base">
        <s-text>Are you sure you want to delete "Winter jacket"?</s-text>
        <s-text tone="caution">This action cannot be undone.</s-text>
      </s-stack>

      <s-button
        slot="primary-action"
        variant="primary"
        tone="critical"
        commandFor="delete-modal"
        command="--hide"
      >
        Delete product
      </s-button>
      <s-button
        slot="secondary-actions"
        variant="secondary"
        commandFor="delete-modal"
        command="--hide"
      >
        Cancel
      </s-button>
    </s-modal>
  </s-stack>
  ```

* #### Modal with form fields

  ##### Description

  Modal containing form fields demonstrating how to structure input fields within a modal. Click the button to open the modal.

  ##### jsx

  ```jsx
  <s-stack gap="base">
    <s-button variant="primary" commandFor="edit-modal" command="--show">
      Edit customer
    </s-button>

    <s-modal id="edit-modal" heading="Edit customer information" size="large">
      <s-stack gap="base">
        <s-text-field
          label="Customer name"
          name="name"
          value="Sarah Johnson"
         />

        <s-email-field
          label="Email address"
          name="email"
          value="sarah@example.com"
         />

        <s-text-field
          label="Phone number"
          name="phone"
          value="+1 555-0123"
         />

        <s-select label="Customer group" name="group">
          <s-option value="retail">Retail</s-option>
          <s-option value="wholesale" selected>
            Wholesale
          </s-option>
          <s-option value="vip">VIP</s-option>
        </s-select>
      </s-stack>

      <s-button
        slot="primary-action"
        variant="primary"
        commandFor="edit-modal"
        command="--hide"
      >
        Save changes
      </s-button>
      <s-button
        slot="secondary-actions"
        variant="secondary"
        commandFor="edit-modal"
        command="--hide"
      >
        Cancel
      </s-button>
    </s-modal>
  </s-stack>
  ```

  ##### html

  ```html
  <s-stack gap="base">
    <s-button variant="primary" commandFor="edit-modal" command="--show">
      Edit customer
    </s-button>

    <s-modal id="edit-modal" heading="Edit customer information" size="large">
      <s-stack gap="base">
        <s-text-field
          label="Customer name"
          name="name"
          value="Sarah Johnson"
        ></s-text-field>

        <s-email-field
          label="Email address"
          name="email"
          value="sarah@example.com"
        ></s-email-field>

        <s-text-field
          label="Phone number"
          name="phone"
          value="+1 555-0123"
        ></s-text-field>

        <s-select label="Customer group" name="group">
          <s-option value="retail">Retail</s-option>
          <s-option value="wholesale" selected>Wholesale</s-option>
          <s-option value="vip">VIP</s-option>
        </s-select>
      </s-stack>

      <s-button
        slot="primary-action"
        variant="primary"
        commandFor="edit-modal"
        command="--hide"
      >
        Save changes
      </s-button>
      <s-button
        slot="secondary-actions"
        variant="secondary"
        commandFor="edit-modal"
        command="--hide"
      >
        Cancel
      </s-button>
    </s-modal>
  </s-stack>
  ```

* #### Different modal sizes

  ##### Description

  Demonstrates various modal sizes for different content requirements. Click each button to see different modal sizes.

  ##### jsx

  ```jsx
  <s-stack gap="base">
    <s-stack direction="inline" gap="base">
      <s-button commandFor="small-modal" command="--show">
        Small modal
      </s-button>
      <s-button commandFor="large-modal" command="--show">
        Large modal
      </s-button>
    </s-stack>

    {/* Small modal for quick confirmations */}
    <s-modal id="small-modal" heading="Confirm action" size="small-100">
      <s-text>Are you sure you want to proceed?</s-text>
      <s-button
        slot="primary-action"
        variant="primary"
        commandFor="small-modal"
        command="--hide"
      >
        Confirm
      </s-button>
      <s-button
        slot="secondary-actions"
        variant="secondary"
        commandFor="small-modal"
        command="--hide"
      >
        Cancel
      </s-button>
    </s-modal>

    {/* Large modal for detailed content */}
    <s-modal id="large-modal" heading="Order details" size="large-100">
      <s-stack gap="base">
        <s-section>
          <s-heading>Order #1001</s-heading>
          <s-text>Placed on March 15, 2024</s-text>
        </s-section>

        <s-divider />

        <s-section>
          <s-heading>Items</s-heading>
          <s-stack gap="small">
            <s-text>Winter jacket - $89.99</s-text>
            <s-text>Wool scarf - $29.99</s-text>
            <s-text>Leather gloves - $45.99</s-text>
          </s-stack>
        </s-section>

        <s-divider />

        <s-text type="strong">Total: $165.97</s-text>
      </s-stack>

      <s-button
        slot="primary-action"
        variant="primary"
        commandFor="large-modal"
        command="--hide"
      >
        Close
      </s-button>
    </s-modal>
  </s-stack>
  ```

  ##### html

  ```html
  <s-stack gap="base">
    <s-stack direction="inline" gap="base">
      <s-button commandFor="small-modal" command="--show">Small modal</s-button>
      <s-button commandFor="large-modal" command="--show">Large modal</s-button>
    </s-stack>

    <!-- Small modal for quick confirmations -->
    <s-modal id="small-modal" heading="Confirm action" size="small-100">
      <s-text>Are you sure you want to proceed?</s-text>
      <s-button
        slot="primary-action"
        variant="primary"
        commandFor="small-modal"
        command="--hide"
      >
        Confirm
      </s-button>
      <s-button
        slot="secondary-actions"
        variant="secondary"
        commandFor="small-modal"
        command="--hide"
      >
        Cancel
      </s-button>
    </s-modal>

    <!-- Large modal for detailed content -->
    <s-modal id="large-modal" heading="Order details" size="large-100">
      <s-stack gap="base">
        <s-section>
          <s-heading>Order #1001</s-heading>
          <s-text>Placed on March 15, 2024</s-text>
        </s-section>

        <s-divider></s-divider>

        <s-section>
          <s-heading>Items</s-heading>
          <s-stack gap="small">
            <s-text>Winter jacket - $89.99</s-text>
            <s-text>Wool scarf - $29.99</s-text>
            <s-text>Leather gloves - $45.99</s-text>
          </s-stack>
        </s-section>

        <s-divider></s-divider>

        <s-text type="strong">Total: $165.97</s-text>
      </s-stack>

      <s-button
        slot="primary-action"
        variant="primary"
        commandFor="large-modal"
        command="--hide"
      >
        Close
      </s-button>
    </s-modal>
  </s-stack>
  ```

* #### Modal without padding

  ##### Description

  Modal with no padding for full-width content. Click to view the modal.

  ##### jsx

  ```jsx
  <s-stack gap="base">
    <s-button commandFor="image-modal" command="--show">
      View product image
    </s-button>

    <s-modal id="image-modal" heading="Product image" padding="none">
      <s-box background="subdued" padding="base">
        <s-text>Image would display here with full width</s-text>
      </s-box>

      <s-button
        slot="secondary-actions"
        variant="secondary"
        commandFor="image-modal"
        command="--hide"
      >
        Close
      </s-button>
    </s-modal>
  </s-stack>
  ```

  ##### html

  ```html
  <s-stack gap="base">
    <s-button commandFor="image-modal" command="--show">
      View product image
    </s-button>

    <s-modal id="image-modal" heading="Product image" padding="none">
      <s-box background="subdued" padding="base">
        <s-text>Image would display here with full width</s-text>
      </s-box>

      <s-button
        slot="secondary-actions"
        variant="secondary"
        commandFor="image-modal"
        command="--hide"
      >
        Close
      </s-button>
    </s-modal>
  </s-stack>
  ```

## Usage

Modals are closed by default and should be triggered by a button using the `commandFor` attribute. The button's `commandFor` value should match the modal's `id`.

## Useful for

* Focusing on a specific task or piece of information
* Completing a flow that needs dedicated attention
* Confirming a significant action before proceeding
* Viewing information that's only temporarily relevant

## Best practices

* Use for focused, specific tasks that require merchants to make a decision or acknowledge critical information
* Include a prominent and clear call to action
* Don't nest modals (avoid launching one modal from another)
* Have concise and descriptive title and button text
* Use thoughtfully and sparingly—don't create unnecessary interruptions
* Use as a last resort for important decisions, not for contextual tools or actions that could happen on the page directly

## Content guidelines

* Use 1-3 word titles in sentence case without punctuation
* Keep body content to 1-2 short sentences
* For destructive actions, explain the consequences
* Use clear action verbs for buttons (e.g., "Delete", "Edit") instead of vague language like "Yes" or "OK"


---
title: Modal
description: >-
  Displays content in an overlay. Use to create a distraction-free experience
  such as a confirmation dialog or a settings panel.
api_name: app-home
source_url:
  html: 'https://shopify.dev/docs/api/app-home/polaris-web-components/overlays/modal'
  md: >-
    https://shopify.dev/docs/api/app-home/polaris-web-components/overlays/modal.md
---

# Modal

Displays content in an overlay. Use to create a distraction-free experience such as a confirmation dialog or a settings panel.

## Properties

* accessibilityLabel

  string

  A label that describes the purpose of the modal. When set, it will be announced to users using assistive technologies and will provide them with more context.

  This overrides the `heading` prop for screen readers.

* heading

  string

  A title that describes the content of the Modal.

* hideOverlay

  () => void

  Method to hide an overlay.

* padding

  "base" | "none"

  Default: 'base'

  Adjust the padding around the Modal content.

  `base`: applies padding that is appropriate for the element.

  `none`: removes all padding from the element. This can be useful when elements inside the Modal need to span to the edge of the Modal. For example, a full-width image. In this case, rely on `Box` with a padding of 'base' to bring back the desired padding for the rest of the content.

* showOverlay

  () => void

  Method to show an overlay.

* size

  "small" | "small-100" | "base" | "large" | "large-100"

  Default: 'base'

  Adjust the size of the Modal.

* toggleOverlay

  () => void

  Method to toggle the visiblity of an overlay.

## Events

Learn more about [registering events](https://shopify.dev/docs/api/app-home/using-polaris-components#event-handling).

* afterhide

  CallbackEventListener\<typeof tagName> | null

* aftershow

  CallbackEventListener\<typeof tagName> | null

* hide

  CallbackEventListener\<typeof tagName> | null

* show

  CallbackEventListener\<typeof tagName> | null

### CallbackEventListener

```ts
(EventListener & {
      (event: CallbackEvent<T>): void;
    }) | null
```

### CallbackEvent

```ts
Event & {
  currentTarget: HTMLElementTagNameMap[T];
}
```

## Slots

* children

  HTMLElement

  The content of the Modal.

* primary-action

  HTMLElement

  The primary action to perform.

  Only a `Button` with a variant of `primary` is allowed.

* secondary-actions

  HTMLElement

  The secondary actions to perform.

  Only `Button` elements with a variant of `secondary` or `auto` are allowed.

Examples

### Examples

* #### Code

  ##### jsx

  ```jsx
  <>
    <s-button commandFor="modal">Open</s-button>

    <s-modal id="modal" heading="Details">
      <s-paragraph>Displaying more details here.</s-paragraph>

      <s-button slot="secondary-actions" commandFor="modal" command="--hide">
        Close
      </s-button>
      <s-button
        slot="primary-action"
        variant="primary"
        commandFor="modal"
        command="--hide"
      >
        Save
      </s-button>
    </s-modal>
  </>
  ```

  ##### html

  ```html
  <s-button commandFor="modal">Open</s-button>

  <s-modal id="modal" heading="Details">
    <s-paragraph>Displaying more details here.</s-paragraph>

    <s-button slot="secondary-actions" commandFor="modal" command="--hide">
      Close
    </s-button>
    <s-button
      slot="primary-action"
      variant="primary"
      commandFor="modal"
      command="--hide"
    >
      Save
    </s-button>
  </s-modal>
  ```

* #### Basic modal

  ##### Description

  Simple modal with heading and basic content for displaying information. Click the button to open the modal.

  ##### jsx

  ```jsx
  <>
    <s-button commandFor="info-modal" command="--show">
      Show product info
    </s-button>

    <s-modal id="info-modal" heading="Product information">
      <s-text>
        This product is currently out of stock and cannot be ordered.
      </s-text>

      <s-button slot="secondary-actions" commandFor="info-modal" command="--hide">
        Close
      </s-button>
    </s-modal>
  </>
  ```

  ##### html

  ```html
  <s-button commandFor="info-modal" command="--show">Show product info</s-button>

  <s-modal id="info-modal" heading="Product information">
    <s-text>This product is currently out of stock and cannot be ordered.</s-text>

    <s-button slot="secondary-actions" commandFor="info-modal" command="--hide">
      Close
    </s-button>
  </s-modal>
  ```

* #### Modal with actions

  ##### Description

  Modal with primary and secondary action buttons. Click the button to open the confirmation modal.

  ##### jsx

  ```jsx
  <s-stack gap="base">
    <s-button tone="critical" commandFor="delete-modal" command="--show">
      Delete product
    </s-button>

    <s-modal id="delete-modal" heading="Delete product?">
      <s-stack gap="base">
        <s-text>Are you sure you want to delete "Winter jacket"?</s-text>
        <s-text tone="caution">This action cannot be undone.</s-text>
      </s-stack>

      <s-button
        slot="primary-action"
        variant="primary"
        tone="critical"
        commandFor="delete-modal"
        command="--hide"
      >
        Delete product
      </s-button>
      <s-button
        slot="secondary-actions"
        variant="secondary"
        commandFor="delete-modal"
        command="--hide"
      >
        Cancel
      </s-button>
    </s-modal>
  </s-stack>
  ```

  ##### html

  ```html
  <s-stack gap="base">
    <s-button tone="critical" commandFor="delete-modal" command="--show">
      Delete product
    </s-button>

    <s-modal id="delete-modal" heading="Delete product?">
      <s-stack gap="base">
        <s-text>Are you sure you want to delete "Winter jacket"?</s-text>
        <s-text tone="caution">This action cannot be undone.</s-text>
      </s-stack>

      <s-button
        slot="primary-action"
        variant="primary"
        tone="critical"
        commandFor="delete-modal"
        command="--hide"
      >
        Delete product
      </s-button>
      <s-button
        slot="secondary-actions"
        variant="secondary"
        commandFor="delete-modal"
        command="--hide"
      >
        Cancel
      </s-button>
    </s-modal>
  </s-stack>
  ```

* #### Modal with form fields

  ##### Description

  Modal containing form fields demonstrating how to structure input fields within a modal. Click the button to open the modal.

  ##### jsx

  ```jsx
  <s-stack gap="base">
    <s-button variant="primary" commandFor="edit-modal" command="--show">
      Edit customer
    </s-button>

    <s-modal id="edit-modal" heading="Edit customer information" size="large">
      <s-stack gap="base">
        <s-text-field
          label="Customer name"
          name="name"
          value="Sarah Johnson"
         />

        <s-email-field
          label="Email address"
          name="email"
          value="sarah@example.com"
         />

        <s-text-field
          label="Phone number"
          name="phone"
          value="+1 555-0123"
         />

        <s-select label="Customer group" name="group">
          <s-option value="retail">Retail</s-option>
          <s-option value="wholesale" selected>
            Wholesale
          </s-option>
          <s-option value="vip">VIP</s-option>
        </s-select>
      </s-stack>

      <s-button
        slot="primary-action"
        variant="primary"
        commandFor="edit-modal"
        command="--hide"
      >
        Save changes
      </s-button>
      <s-button
        slot="secondary-actions"
        variant="secondary"
        commandFor="edit-modal"
        command="--hide"
      >
        Cancel
      </s-button>
    </s-modal>
  </s-stack>
  ```

  ##### html

  ```html
  <s-stack gap="base">
    <s-button variant="primary" commandFor="edit-modal" command="--show">
      Edit customer
    </s-button>

    <s-modal id="edit-modal" heading="Edit customer information" size="large">
      <s-stack gap="base">
        <s-text-field
          label="Customer name"
          name="name"
          value="Sarah Johnson"
        ></s-text-field>

        <s-email-field
          label="Email address"
          name="email"
          value="sarah@example.com"
        ></s-email-field>

        <s-text-field
          label="Phone number"
          name="phone"
          value="+1 555-0123"
        ></s-text-field>

        <s-select label="Customer group" name="group">
          <s-option value="retail">Retail</s-option>
          <s-option value="wholesale" selected>Wholesale</s-option>
          <s-option value="vip">VIP</s-option>
        </s-select>
      </s-stack>

      <s-button
        slot="primary-action"
        variant="primary"
        commandFor="edit-modal"
        command="--hide"
      >
        Save changes
      </s-button>
      <s-button
        slot="secondary-actions"
        variant="secondary"
        commandFor="edit-modal"
        command="--hide"
      >
        Cancel
      </s-button>
    </s-modal>
  </s-stack>
  ```

* #### Different modal sizes

  ##### Description

  Demonstrates various modal sizes for different content requirements. Click each button to see different modal sizes.

  ##### jsx

  ```jsx
  <s-stack gap="base">
    <s-stack direction="inline" gap="base">
      <s-button commandFor="small-modal" command="--show">
        Small modal
      </s-button>
      <s-button commandFor="large-modal" command="--show">
        Large modal
      </s-button>
    </s-stack>

    {/* Small modal for quick confirmations */}
    <s-modal id="small-modal" heading="Confirm action" size="small-100">
      <s-text>Are you sure you want to proceed?</s-text>
      <s-button
        slot="primary-action"
        variant="primary"
        commandFor="small-modal"
        command="--hide"
      >
        Confirm
      </s-button>
      <s-button
        slot="secondary-actions"
        variant="secondary"
        commandFor="small-modal"
        command="--hide"
      >
        Cancel
      </s-button>
    </s-modal>

    {/* Large modal for detailed content */}
    <s-modal id="large-modal" heading="Order details" size="large-100">
      <s-stack gap="base">
        <s-section>
          <s-heading>Order #1001</s-heading>
          <s-text>Placed on March 15, 2024</s-text>
        </s-section>

        <s-divider />

        <s-section>
          <s-heading>Items</s-heading>
          <s-stack gap="small">
            <s-text>Winter jacket - $89.99</s-text>
            <s-text>Wool scarf - $29.99</s-text>
            <s-text>Leather gloves - $45.99</s-text>
          </s-stack>
        </s-section>

        <s-divider />

        <s-text type="strong">Total: $165.97</s-text>
      </s-stack>

      <s-button
        slot="primary-action"
        variant="primary"
        commandFor="large-modal"
        command="--hide"
      >
        Close
      </s-button>
    </s-modal>
  </s-stack>
  ```

  ##### html

  ```html
  <s-stack gap="base">
    <s-stack direction="inline" gap="base">
      <s-button commandFor="small-modal" command="--show">Small modal</s-button>
      <s-button commandFor="large-modal" command="--show">Large modal</s-button>
    </s-stack>

    <!-- Small modal for quick confirmations -->
    <s-modal id="small-modal" heading="Confirm action" size="small-100">
      <s-text>Are you sure you want to proceed?</s-text>
      <s-button
        slot="primary-action"
        variant="primary"
        commandFor="small-modal"
        command="--hide"
      >
        Confirm
      </s-button>
      <s-button
        slot="secondary-actions"
        variant="secondary"
        commandFor="small-modal"
        command="--hide"
      >
        Cancel
      </s-button>
    </s-modal>

    <!-- Large modal for detailed content -->
    <s-modal id="large-modal" heading="Order details" size="large-100">
      <s-stack gap="base">
        <s-section>
          <s-heading>Order #1001</s-heading>
          <s-text>Placed on March 15, 2024</s-text>
        </s-section>

        <s-divider></s-divider>

        <s-section>
          <s-heading>Items</s-heading>
          <s-stack gap="small">
            <s-text>Winter jacket - $89.99</s-text>
            <s-text>Wool scarf - $29.99</s-text>
            <s-text>Leather gloves - $45.99</s-text>
          </s-stack>
        </s-section>

        <s-divider></s-divider>

        <s-text type="strong">Total: $165.97</s-text>
      </s-stack>

      <s-button
        slot="primary-action"
        variant="primary"
        commandFor="large-modal"
        command="--hide"
      >
        Close
      </s-button>
    </s-modal>
  </s-stack>
  ```

* #### Modal without padding

  ##### Description

  Modal with no padding for full-width content. Click to view the modal.

  ##### jsx

  ```jsx
  <s-stack gap="base">
    <s-button commandFor="image-modal" command="--show">
      View product image
    </s-button>

    <s-modal id="image-modal" heading="Product image" padding="none">
      <s-box background="subdued" padding="base">
        <s-text>Image would display here with full width</s-text>
      </s-box>

      <s-button
        slot="secondary-actions"
        variant="secondary"
        commandFor="image-modal"
        command="--hide"
      >
        Close
      </s-button>
    </s-modal>
  </s-stack>
  ```

  ##### html

  ```html
  <s-stack gap="base">
    <s-button commandFor="image-modal" command="--show">
      View product image
    </s-button>

    <s-modal id="image-modal" heading="Product image" padding="none">
      <s-box background="subdued" padding="base">
        <s-text>Image would display here with full width</s-text>
      </s-box>

      <s-button
        slot="secondary-actions"
        variant="secondary"
        commandFor="image-modal"
        command="--hide"
      >
        Close
      </s-button>
    </s-modal>
  </s-stack>
  ```

## Usage

Modals are closed by default and should be triggered by a button using the `commandFor` attribute. The button's `commandFor` value should match the modal's `id`.

## Useful for

* Focusing on a specific task or piece of information
* Completing a flow that needs dedicated attention
* Confirming a significant action before proceeding
* Viewing information that's only temporarily relevant

## Best practices

* Use for focused, specific tasks that require merchants to make a decision or acknowledge critical information
* Include a prominent and clear call to action
* Don't nest modals (avoid launching one modal from another)
* Have concise and descriptive title and button text
* Use thoughtfully and sparingly—don't create unnecessary interruptions
* Use as a last resort for important decisions, not for contextual tools or actions that could happen on the page directly

## Content guidelines

* Use 1-3 word titles in sentence case without punctuation
* Keep body content to 1-2 short sentences
* For destructive actions, explain the consequences
* Use clear action verbs for buttons (e.g., "Delete", "Edit") instead of vague language like "Yes" or "OK"


---
title: Modal
description: >-
  Displays content in an overlay. Use to create a distraction-free experience
  such as a confirmation dialog or a settings panel.
api_name: app-home
source_url:
  html: 'https://shopify.dev/docs/api/app-home/polaris-web-components/overlays/modal'
  md: >-
    https://shopify.dev/docs/api/app-home/polaris-web-components/overlays/modal.md
---

# Modal

Displays content in an overlay. Use to create a distraction-free experience such as a confirmation dialog or a settings panel.

## Properties

* accessibilityLabel

  string

  A label that describes the purpose of the modal. When set, it will be announced to users using assistive technologies and will provide them with more context.

  This overrides the `heading` prop for screen readers.

* heading

  string

  A title that describes the content of the Modal.

* hideOverlay

  () => void

  Method to hide an overlay.

* padding

  "base" | "none"

  Default: 'base'

  Adjust the padding around the Modal content.

  `base`: applies padding that is appropriate for the element.

  `none`: removes all padding from the element. This can be useful when elements inside the Modal need to span to the edge of the Modal. For example, a full-width image. In this case, rely on `Box` with a padding of 'base' to bring back the desired padding for the rest of the content.

* showOverlay

  () => void

  Method to show an overlay.

* size

  "small" | "small-100" | "base" | "large" | "large-100"

  Default: 'base'

  Adjust the size of the Modal.

* toggleOverlay

  () => void

  Method to toggle the visiblity of an overlay.

## Events

Learn more about [registering events](https://shopify.dev/docs/api/app-home/using-polaris-components#event-handling).

* afterhide

  CallbackEventListener\<typeof tagName> | null

* aftershow

  CallbackEventListener\<typeof tagName> | null

* hide

  CallbackEventListener\<typeof tagName> | null

* show

  CallbackEventListener\<typeof tagName> | null

### CallbackEventListener

```ts
(EventListener & {
      (event: CallbackEvent<T>): void;
    }) | null
```

### CallbackEvent

```ts
Event & {
  currentTarget: HTMLElementTagNameMap[T];
}
```

## Slots

* children

  HTMLElement

  The content of the Modal.

* primary-action

  HTMLElement

  The primary action to perform.

  Only a `Button` with a variant of `primary` is allowed.

* secondary-actions

  HTMLElement

  The secondary actions to perform.

  Only `Button` elements with a variant of `secondary` or `auto` are allowed.

Examples

### Examples

* #### Code

  ##### jsx

  ```jsx
  <>
    <s-button commandFor="modal">Open</s-button>

    <s-modal id="modal" heading="Details">
      <s-paragraph>Displaying more details here.</s-paragraph>

      <s-button slot="secondary-actions" commandFor="modal" command="--hide">
        Close
      </s-button>
      <s-button
        slot="primary-action"
        variant="primary"
        commandFor="modal"
        command="--hide"
      >
        Save
      </s-button>
    </s-modal>
  </>
  ```

  ##### html

  ```html
  <s-button commandFor="modal">Open</s-button>

  <s-modal id="modal" heading="Details">
    <s-paragraph>Displaying more details here.</s-paragraph>

    <s-button slot="secondary-actions" commandFor="modal" command="--hide">
      Close
    </s-button>
    <s-button
      slot="primary-action"
      variant="primary"
      commandFor="modal"
      command="--hide"
    >
      Save
    </s-button>
  </s-modal>
  ```

* #### Basic modal

  ##### Description

  Simple modal with heading and basic content for displaying information. Click the button to open the modal.

  ##### jsx

  ```jsx
  <>
    <s-button commandFor="info-modal" command="--show">
      Show product info
    </s-button>

    <s-modal id="info-modal" heading="Product information">
      <s-text>
        This product is currently out of stock and cannot be ordered.
      </s-text>

      <s-button slot="secondary-actions" commandFor="info-modal" command="--hide">
        Close
      </s-button>
    </s-modal>
  </>
  ```

  ##### html

  ```html
  <s-button commandFor="info-modal" command="--show">Show product info</s-button>

  <s-modal id="info-modal" heading="Product information">
    <s-text>This product is currently out of stock and cannot be ordered.</s-text>

    <s-button slot="secondary-actions" commandFor="info-modal" command="--hide">
      Close
    </s-button>
  </s-modal>
  ```

* #### Modal with actions

  ##### Description

  Modal with primary and secondary action buttons. Click the button to open the confirmation modal.

  ##### jsx

  ```jsx
  <s-stack gap="base">
    <s-button tone="critical" commandFor="delete-modal" command="--show">
      Delete product
    </s-button>

    <s-modal id="delete-modal" heading="Delete product?">
      <s-stack gap="base">
        <s-text>Are you sure you want to delete "Winter jacket"?</s-text>
        <s-text tone="caution">This action cannot be undone.</s-text>
      </s-stack>

      <s-button
        slot="primary-action"
        variant="primary"
        tone="critical"
        commandFor="delete-modal"
        command="--hide"
      >
        Delete product
      </s-button>
      <s-button
        slot="secondary-actions"
        variant="secondary"
        commandFor="delete-modal"
        command="--hide"
      >
        Cancel
      </s-button>
    </s-modal>
  </s-stack>
  ```

  ##### html

  ```html
  <s-stack gap="base">
    <s-button tone="critical" commandFor="delete-modal" command="--show">
      Delete product
    </s-button>

    <s-modal id="delete-modal" heading="Delete product?">
      <s-stack gap="base">
        <s-text>Are you sure you want to delete "Winter jacket"?</s-text>
        <s-text tone="caution">This action cannot be undone.</s-text>
      </s-stack>

      <s-button
        slot="primary-action"
        variant="primary"
        tone="critical"
        commandFor="delete-modal"
        command="--hide"
      >
        Delete product
      </s-button>
      <s-button
        slot="secondary-actions"
        variant="secondary"
        commandFor="delete-modal"
        command="--hide"
      >
        Cancel
      </s-button>
    </s-modal>
  </s-stack>
  ```

* #### Modal with form fields

  ##### Description

  Modal containing form fields demonstrating how to structure input fields within a modal. Click the button to open the modal.

  ##### jsx

  ```jsx
  <s-stack gap="base">
    <s-button variant="primary" commandFor="edit-modal" command="--show">
      Edit customer
    </s-button>

    <s-modal id="edit-modal" heading="Edit customer information" size="large">
      <s-stack gap="base">
        <s-text-field
          label="Customer name"
          name="name"
          value="Sarah Johnson"
         />

        <s-email-field
          label="Email address"
          name="email"
          value="sarah@example.com"
         />

        <s-text-field
          label="Phone number"
          name="phone"
          value="+1 555-0123"
         />

        <s-select label="Customer group" name="group">
          <s-option value="retail">Retail</s-option>
          <s-option value="wholesale" selected>
            Wholesale
          </s-option>
          <s-option value="vip">VIP</s-option>
        </s-select>
      </s-stack>

      <s-button
        slot="primary-action"
        variant="primary"
        commandFor="edit-modal"
        command="--hide"
      >
        Save changes
      </s-button>
      <s-button
        slot="secondary-actions"
        variant="secondary"
        commandFor="edit-modal"
        command="--hide"
      >
        Cancel
      </s-button>
    </s-modal>
  </s-stack>
  ```

  ##### html

  ```html
  <s-stack gap="base">
    <s-button variant="primary" commandFor="edit-modal" command="--show">
      Edit customer
    </s-button>

    <s-modal id="edit-modal" heading="Edit customer information" size="large">
      <s-stack gap="base">
        <s-text-field
          label="Customer name"
          name="name"
          value="Sarah Johnson"
        ></s-text-field>

        <s-email-field
          label="Email address"
          name="email"
          value="sarah@example.com"
        ></s-email-field>

        <s-text-field
          label="Phone number"
          name="phone"
          value="+1 555-0123"
        ></s-text-field>

        <s-select label="Customer group" name="group">
          <s-option value="retail">Retail</s-option>
          <s-option value="wholesale" selected>Wholesale</s-option>
          <s-option value="vip">VIP</s-option>
        </s-select>
      </s-stack>

      <s-button
        slot="primary-action"
        variant="primary"
        commandFor="edit-modal"
        command="--hide"
      >
        Save changes
      </s-button>
      <s-button
        slot="secondary-actions"
        variant="secondary"
        commandFor="edit-modal"
        command="--hide"
      >
        Cancel
      </s-button>
    </s-modal>
  </s-stack>
  ```

* #### Different modal sizes

  ##### Description

  Demonstrates various modal sizes for different content requirements. Click each button to see different modal sizes.

  ##### jsx

  ```jsx
  <s-stack gap="base">
    <s-stack direction="inline" gap="base">
      <s-button commandFor="small-modal" command="--show">
        Small modal
      </s-button>
      <s-button commandFor="large-modal" command="--show">
        Large modal
      </s-button>
    </s-stack>

    {/* Small modal for quick confirmations */}
    <s-modal id="small-modal" heading="Confirm action" size="small-100">
      <s-text>Are you sure you want to proceed?</s-text>
      <s-button
        slot="primary-action"
        variant="primary"
        commandFor="small-modal"
        command="--hide"
      >
        Confirm
      </s-button>
      <s-button
        slot="secondary-actions"
        variant="secondary"
        commandFor="small-modal"
        command="--hide"
      >
        Cancel
      </s-button>
    </s-modal>

    {/* Large modal for detailed content */}
    <s-modal id="large-modal" heading="Order details" size="large-100">
      <s-stack gap="base">
        <s-section>
          <s-heading>Order #1001</s-heading>
          <s-text>Placed on March 15, 2024</s-text>
        </s-section>

        <s-divider />

        <s-section>
          <s-heading>Items</s-heading>
          <s-stack gap="small">
            <s-text>Winter jacket - $89.99</s-text>
            <s-text>Wool scarf - $29.99</s-text>
            <s-text>Leather gloves - $45.99</s-text>
          </s-stack>
        </s-section>

        <s-divider />

        <s-text type="strong">Total: $165.97</s-text>
      </s-stack>

      <s-button
        slot="primary-action"
        variant="primary"
        commandFor="large-modal"
        command="--hide"
      >
        Close
      </s-button>
    </s-modal>
  </s-stack>
  ```

  ##### html

  ```html
  <s-stack gap="base">
    <s-stack direction="inline" gap="base">
      <s-button commandFor="small-modal" command="--show">Small modal</s-button>
      <s-button commandFor="large-modal" command="--show">Large modal</s-button>
    </s-stack>

    <!-- Small modal for quick confirmations -->
    <s-modal id="small-modal" heading="Confirm action" size="small-100">
      <s-text>Are you sure you want to proceed?</s-text>
      <s-button
        slot="primary-action"
        variant="primary"
        commandFor="small-modal"
        command="--hide"
      >
        Confirm
      </s-button>
      <s-button
        slot="secondary-actions"
        variant="secondary"
        commandFor="small-modal"
        command="--hide"
      >
        Cancel
      </s-button>
    </s-modal>

    <!-- Large modal for detailed content -->
    <s-modal id="large-modal" heading="Order details" size="large-100">
      <s-stack gap="base">
        <s-section>
          <s-heading>Order #1001</s-heading>
          <s-text>Placed on March 15, 2024</s-text>
        </s-section>

        <s-divider></s-divider>

        <s-section>
          <s-heading>Items</s-heading>
          <s-stack gap="small">
            <s-text>Winter jacket - $89.99</s-text>
            <s-text>Wool scarf - $29.99</s-text>
            <s-text>Leather gloves - $45.99</s-text>
          </s-stack>
        </s-section>

        <s-divider></s-divider>

        <s-text type="strong">Total: $165.97</s-text>
      </s-stack>

      <s-button
        slot="primary-action"
        variant="primary"
        commandFor="large-modal"
        command="--hide"
      >
        Close
      </s-button>
    </s-modal>
  </s-stack>
  ```

* #### Modal without padding

  ##### Description

  Modal with no padding for full-width content. Click to view the modal.

  ##### jsx

  ```jsx
  <s-stack gap="base">
    <s-button commandFor="image-modal" command="--show">
      View product image
    </s-button>

    <s-modal id="image-modal" heading="Product image" padding="none">
      <s-box background="subdued" padding="base">
        <s-text>Image would display here with full width</s-text>
      </s-box>

      <s-button
        slot="secondary-actions"
        variant="secondary"
        commandFor="image-modal"
        command="--hide"
      >
        Close
      </s-button>
    </s-modal>
  </s-stack>
  ```

  ##### html

  ```html
  <s-stack gap="base">
    <s-button commandFor="image-modal" command="--show">
      View product image
    </s-button>

    <s-modal id="image-modal" heading="Product image" padding="none">
      <s-box background="subdued" padding="base">
        <s-text>Image would display here with full width</s-text>
      </s-box>

      <s-button
        slot="secondary-actions"
        variant="secondary"
        commandFor="image-modal"
        command="--hide"
      >
        Close
      </s-button>
    </s-modal>
  </s-stack>
  ```

## Usage

Modals are closed by default and should be triggered by a button using the `commandFor` attribute. The button's `commandFor` value should match the modal's `id`.

## Useful for

* Focusing on a specific task or piece of information
* Completing a flow that needs dedicated attention
* Confirming a significant action before proceeding
* Viewing information that's only temporarily relevant

## Best practices

* Use for focused, specific tasks that require merchants to make a decision or acknowledge critical information
* Include a prominent and clear call to action
* Don't nest modals (avoid launching one modal from another)
* Have concise and descriptive title and button text
* Use thoughtfully and sparingly—don't create unnecessary interruptions
* Use as a last resort for important decisions, not for contextual tools or actions that could happen on the page directly

## Content guidelines

* Use 1-3 word titles in sentence case without punctuation
* Keep body content to 1-2 short sentences
* For destructive actions, explain the consequences
* Use clear action verbs for buttons (e.g., "Delete", "Edit") instead of vague language like "Yes" or "OK"


---
title: Spinner
description: >-
  Displays an animated indicator showing users that content or actions are
  loading. Use to communicate ongoing processes, such as fetching data from a
  server. For loading states on buttons, use the “loading” property on the
  Button component instead.
api_name: app-home
source_url:
  html: >-
    https://shopify.dev/docs/api/app-home/polaris-web-components/feedback/spinner
  md: >-
    https://shopify.dev/docs/api/app-home/polaris-web-components/feedback/spinner.md
---

# Spinner

Displays an animated indicator showing users that content or actions are loading. Use to communicate ongoing processes, such as fetching data from a server. For loading states on buttons, use the “loading” property on the Button component instead.

## Properties

* accessibilityLabel

  string

  A label that describes the purpose of the progress. When set, it will be announced to users using assistive technologies and will provide them with more context. Providing an `accessibilityLabel` is recommended if there is no accompanying text describing that something is loading.

* size

  "base" | "large" | "large-100"

  Default: 'base'

Examples

### Examples

* #### Code

  ##### jsx

  ```jsx
  <s-spinner accessibilityLabel="Loading" size="large-100" />
  ```

  ##### html

  ```html
  <s-spinner accessibilityLabel="Loading" size="large-100"></s-spinner>
  ```

* #### Basic usage

  ##### Description

  Standard loading spinner with accessibility label for screen readers.

  ##### jsx

  ```jsx
  <s-spinner accessibilityLabel="Loading content" />
  ```

  ##### html

  ```html
  <s-spinner accessibilityLabel="Loading content"></s-spinner>
  ```

* #### Loading state in section

  ##### Description

  Centered loading indicator with text in a section layout for content loading states.

  ##### jsx

  ```jsx
  <s-stack alignItems="center" gap="base" padding="large">
    <s-spinner accessibilityLabel="Loading products" size="large" />
    <s-text>Loading products...</s-text>
  </s-stack>
  ```

  ##### html

  ```html
  <s-stack alignItems="center" gap="base" padding="large">
    <s-spinner accessibilityLabel="Loading products" size="large"></s-spinner>
    <s-text>Loading products...</s-text>
  </s-stack>
  ```

* #### Inline loading with text

  ##### Description

  Compact inline loading indicator for form submissions and quick actions.

  ##### jsx

  ```jsx
  <s-stack direction="inline" alignItems="center" gap="small">
    <s-spinner accessibilityLabel="Saving" />
    <s-text>Saving...</s-text>
  </s-stack>
  ```

  ##### html

  ```html
  <s-stack direction="inline" alignItems="center" gap="small">
    <s-spinner accessibilityLabel="Saving"></s-spinner>
    <s-text>Saving...</s-text>
  </s-stack>
  ```

## Best practices

* Use to notify merchants that their action is being processed
* Don't use for entire page loads

---
title: Banner
description: >-
  Highlights important information or required actions prominently within the
  interface. Use to communicate statuses, provide feedback, or draw attention to
  critical updates.
api_name: app-home
source_url:
  html: 'https://shopify.dev/docs/api/app-home/polaris-web-components/feedback/banner'
  md: >-
    https://shopify.dev/docs/api/app-home/polaris-web-components/feedback/banner.md
---

# Banner

Highlights important information or required actions prominently within the interface. Use to communicate statuses, provide feedback, or draw attention to critical updates.

## Properties

* dismissible

  boolean

  Default: false

  Determines whether the close button of the banner is present.

  When the close button is pressed, the `dismiss` event will fire, then `hidden` will be true, any animation will complete, and the `afterhide` event will fire.

* heading

  string

  Default: ''

  The title of the banner.

* hidden

  boolean

  Default: false

  Determines whether the banner is hidden.

  If this property is being set on each framework render (as in 'controlled' usage), and the banner is `dismissible`, ensure you update app state for this property when the `dismiss` event fires.

  If the banner is not `dismissible`, it can still be hidden by setting this property.

* tone

  "info" | "success" | "warning" | "critical" | "auto"

  Default: 'auto'

  Sets the tone of the Banner, based on the intention of the information being conveyed.

  The banner is a live region and the type of status will be dictated by the Tone selected.

  * `critical` creates an [assertive live region](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/alert_role) that is announced by screen readers immediately.
  * `neutral`, `info`, `success`, `warning` and `caution` creates an [informative live region](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/status_role) that is announced by screen readers after the current message.

## Events

Learn more about [registering events](https://shopify.dev/docs/api/app-home/using-polaris-components#event-handling).

* afterhide

  CallbackEventListener\<typeof tagName> | null

* dismiss

  CallbackEventListener\<typeof tagName> | null

### CallbackEventListener

```ts
(EventListener & {
      (event: CallbackEvent<T>): void;
    }) | null
```

### CallbackEvent

```ts
Event & {
  currentTarget: HTMLElementTagNameMap[T];
}
```

## Slots

* children

  HTMLElement

  The content of the Banner.

* secondary-actions

  HTMLElement

  The secondary actions to display at the bottom of the Banner.

  Only Buttons with the `variant` of "secondary" or "auto" are permitted. A maximum of two `s-button` components are allowed.

Examples

### Examples

* #### Code

  ##### jsx

  ```jsx
  <s-banner heading="Order archived" tone="info" dismissible>
    This order was archived on March 7, 2017 at 3:12pm EDT.
  </s-banner>
  ```

  ##### html

  ```html
  <s-banner heading="Order archived" tone="info" dismissible>
    This order was archived on March 7, 2017 at 3:12pm EDT.
  </s-banner>
  ```

* #### Basic information banner

  ##### Description

  Demonstrates a simple informational banner used to communicate status updates or completed actions, providing clear and concise feedback to the user.

  ##### jsx

  ```jsx
  <s-banner heading="Order archived">
    This order was archived on March 7, 2017 at 3:12pm EDT.
  </s-banner>
  ```

  ##### html

  ```html
  <s-banner heading="Order archived">
    This order was archived on March 7, 2017 at 3:12pm EDT.
  </s-banner>
  ```

* #### Warning banner with specific actions

  ##### Description

  Illustrates a warning banner that highlights a potential issue and provides actionable buttons to help users resolve the problem quickly and effectively.

  ##### jsx

  ```jsx
  <s-banner heading="127 products missing shipping weights" tone="warning">
    Products without weights may show inaccurate shipping rates, leading to
    checkout abandonment.
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/products?filter=missing-weights"
    >
      Review products
    </s-button>
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="javascript:void(0)"
    >
      Setup guide
    </s-button>
  </s-banner>
  ```

  ##### html

  ```html
  <s-banner heading="127 products missing shipping weights" tone="warning">
    Products without weights may show inaccurate shipping rates, leading to
    checkout abandonment.
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/products?filter=missing-weights"
    >
      Review products
    </s-button>
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="javascript:void(0)"
    >
      Setup guide
    </s-button>
  </s-banner>
  ```

* #### Critical banner with clear next steps

  ##### Description

  Demonstrates an urgent banner design that signals a critical issue requiring immediate action, with clear and prominent secondary action buttons to guide users.

  ##### jsx

  ```jsx
  <s-banner heading="Order #1024 flagged for fraud review" tone="critical">
    This order shows multiple risk indicators and cannot be auto-fulfilled. Review
    required within 24 hours to prevent automatic cancellation.
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/orders/1024/risk"
    >
      Review order details
    </s-button>
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/settings/payments/fraud"
    >
      Adjust fraud settings
    </s-button>
  </s-banner>
  ```

  ##### html

  ```html
  <s-banner heading="Order #1024 flagged for fraud review" tone="critical">
    This order shows multiple risk indicators and cannot be auto-fulfilled. Review
    required within 24 hours to prevent automatic cancellation.
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/orders/1024/risk"
    >
      Review order details
    </s-button>
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/settings/payments/fraud"
    >
      Adjust fraud settings
    </s-button>
  </s-banner>
  ```

* #### Dismissible success banner

  ##### Description

  Success confirmation with dismiss option for completed operations.

  ##### jsx

  ```jsx
  <s-banner heading="Products imported" tone="success" dismissible={true}>
    Successfully imported 50 products to your store.
  </s-banner>
  ```

  ##### html

  ```html
  <s-banner heading="Products imported" tone="success" dismissible="true">
    Successfully imported 50 products to your store.
  </s-banner>
  ```

* #### Info banner with clear value proposition

  ##### Description

  Informational banner highlighting app updates with clear benefits and actions.

  ##### jsx

  ```jsx
  <s-banner heading="Point of Sale v2.4 available" tone="info" dismissible>
    New version includes faster checkout processing and inventory sync
    improvements.
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/apps/pos/changelog"
    >
      View changes
    </s-button>
    <s-button slot="secondary-actions" variant="secondary">
      Install update
    </s-button>
  </s-banner>
  ```

  ##### html

  ```html
  <s-banner heading="Point of Sale v2.4 available" tone="info" dismissible>
    New version includes faster checkout processing and inventory sync
    improvements.
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/apps/pos/changelog"
    >
      View changes
    </s-button>
    <s-button slot="secondary-actions" variant="secondary">
      Install update
    </s-button>
  </s-banner>
  ```

## Useful for

* Showing important information or changes
* Prompting merchants to take a specific action
* Displaying warnings, errors, or critical information
* Communicating persistent conditions that need attention

## Outside of a section

Banners placed outside of a section will display in their own card and should be located at the top of the page. They're useful for conveying messages that apply to the entire page or areas not visible within the viewport, such as validation errors further down the page.

## In a section

Banners placed inside a section will have styles applied contextually. They're useful for conveying messages relevant to a specific section or piece of content.

## Best practices

* Seeing these banners can be stressful, so use them sparingly to avoid overwhelming users.
* Focus on a single piece of information or required action to avoid overwhelming users.
* Make the message concise and scannable. Users shouldn’t need to spend a lot of time figuring out what they need to know and do.
* Info, Warning and Critical banners should contain a call to action and clear next steps. Users should know what to do after seeing the banner.
* Avoid banners that can't be dismissed unless the user is required to take action.

## Content guidelines

* Keep titles concise and clear
* Limit body content to 1-2 sentences where possible
* Use action-led buttons with strong verbs (e.g., "Activate Apple Pay" not "Try Apple Pay")
* Avoid unnecessary words and articles in button text
* For warning and critical banners, explain how to resolve the issue

---
title: Banner
description: >-
  Highlights important information or required actions prominently within the
  interface. Use to communicate statuses, provide feedback, or draw attention to
  critical updates.
api_name: app-home
source_url:
  html: 'https://shopify.dev/docs/api/app-home/polaris-web-components/feedback/banner'
  md: >-
    https://shopify.dev/docs/api/app-home/polaris-web-components/feedback/banner.md
---

# Banner

Highlights important information or required actions prominently within the interface. Use to communicate statuses, provide feedback, or draw attention to critical updates.

## Properties

* dismissible

  boolean

  Default: false

  Determines whether the close button of the banner is present.

  When the close button is pressed, the `dismiss` event will fire, then `hidden` will be true, any animation will complete, and the `afterhide` event will fire.

* heading

  string

  Default: ''

  The title of the banner.

* hidden

  boolean

  Default: false

  Determines whether the banner is hidden.

  If this property is being set on each framework render (as in 'controlled' usage), and the banner is `dismissible`, ensure you update app state for this property when the `dismiss` event fires.

  If the banner is not `dismissible`, it can still be hidden by setting this property.

* tone

  "info" | "success" | "warning" | "critical" | "auto"

  Default: 'auto'

  Sets the tone of the Banner, based on the intention of the information being conveyed.

  The banner is a live region and the type of status will be dictated by the Tone selected.

  * `critical` creates an [assertive live region](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/alert_role) that is announced by screen readers immediately.
  * `neutral`, `info`, `success`, `warning` and `caution` creates an [informative live region](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/status_role) that is announced by screen readers after the current message.

## Events

Learn more about [registering events](https://shopify.dev/docs/api/app-home/using-polaris-components#event-handling).

* afterhide

  CallbackEventListener\<typeof tagName> | null

* dismiss

  CallbackEventListener\<typeof tagName> | null

### CallbackEventListener

```ts
(EventListener & {
      (event: CallbackEvent<T>): void;
    }) | null
```

### CallbackEvent

```ts
Event & {
  currentTarget: HTMLElementTagNameMap[T];
}
```

## Slots

* children

  HTMLElement

  The content of the Banner.

* secondary-actions

  HTMLElement

  The secondary actions to display at the bottom of the Banner.

  Only Buttons with the `variant` of "secondary" or "auto" are permitted. A maximum of two `s-button` components are allowed.

Examples

### Examples

* #### Code

  ##### jsx

  ```jsx
  <s-banner heading="Order archived" tone="info" dismissible>
    This order was archived on March 7, 2017 at 3:12pm EDT.
  </s-banner>
  ```

  ##### html

  ```html
  <s-banner heading="Order archived" tone="info" dismissible>
    This order was archived on March 7, 2017 at 3:12pm EDT.
  </s-banner>
  ```

* #### Basic information banner

  ##### Description

  Demonstrates a simple informational banner used to communicate status updates or completed actions, providing clear and concise feedback to the user.

  ##### jsx

  ```jsx
  <s-banner heading="Order archived">
    This order was archived on March 7, 2017 at 3:12pm EDT.
  </s-banner>
  ```

  ##### html

  ```html
  <s-banner heading="Order archived">
    This order was archived on March 7, 2017 at 3:12pm EDT.
  </s-banner>
  ```

* #### Warning banner with specific actions

  ##### Description

  Illustrates a warning banner that highlights a potential issue and provides actionable buttons to help users resolve the problem quickly and effectively.

  ##### jsx

  ```jsx
  <s-banner heading="127 products missing shipping weights" tone="warning">
    Products without weights may show inaccurate shipping rates, leading to
    checkout abandonment.
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/products?filter=missing-weights"
    >
      Review products
    </s-button>
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="javascript:void(0)"
    >
      Setup guide
    </s-button>
  </s-banner>
  ```

  ##### html

  ```html
  <s-banner heading="127 products missing shipping weights" tone="warning">
    Products without weights may show inaccurate shipping rates, leading to
    checkout abandonment.
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/products?filter=missing-weights"
    >
      Review products
    </s-button>
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="javascript:void(0)"
    >
      Setup guide
    </s-button>
  </s-banner>
  ```

* #### Critical banner with clear next steps

  ##### Description

  Demonstrates an urgent banner design that signals a critical issue requiring immediate action, with clear and prominent secondary action buttons to guide users.

  ##### jsx

  ```jsx
  <s-banner heading="Order #1024 flagged for fraud review" tone="critical">
    This order shows multiple risk indicators and cannot be auto-fulfilled. Review
    required within 24 hours to prevent automatic cancellation.
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/orders/1024/risk"
    >
      Review order details
    </s-button>
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/settings/payments/fraud"
    >
      Adjust fraud settings
    </s-button>
  </s-banner>
  ```

  ##### html

  ```html
  <s-banner heading="Order #1024 flagged for fraud review" tone="critical">
    This order shows multiple risk indicators and cannot be auto-fulfilled. Review
    required within 24 hours to prevent automatic cancellation.
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/orders/1024/risk"
    >
      Review order details
    </s-button>
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/settings/payments/fraud"
    >
      Adjust fraud settings
    </s-button>
  </s-banner>
  ```

* #### Dismissible success banner

  ##### Description

  Success confirmation with dismiss option for completed operations.

  ##### jsx

  ```jsx
  <s-banner heading="Products imported" tone="success" dismissible={true}>
    Successfully imported 50 products to your store.
  </s-banner>
  ```

  ##### html

  ```html
  <s-banner heading="Products imported" tone="success" dismissible="true">
    Successfully imported 50 products to your store.
  </s-banner>
  ```

* #### Info banner with clear value proposition

  ##### Description

  Informational banner highlighting app updates with clear benefits and actions.

  ##### jsx

  ```jsx
  <s-banner heading="Point of Sale v2.4 available" tone="info" dismissible>
    New version includes faster checkout processing and inventory sync
    improvements.
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/apps/pos/changelog"
    >
      View changes
    </s-button>
    <s-button slot="secondary-actions" variant="secondary">
      Install update
    </s-button>
  </s-banner>
  ```

  ##### html

  ```html
  <s-banner heading="Point of Sale v2.4 available" tone="info" dismissible>
    New version includes faster checkout processing and inventory sync
    improvements.
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/apps/pos/changelog"
    >
      View changes
    </s-button>
    <s-button slot="secondary-actions" variant="secondary">
      Install update
    </s-button>
  </s-banner>
  ```

## Useful for

* Showing important information or changes
* Prompting merchants to take a specific action
* Displaying warnings, errors, or critical information
* Communicating persistent conditions that need attention

## Outside of a section

Banners placed outside of a section will display in their own card and should be located at the top of the page. They're useful for conveying messages that apply to the entire page or areas not visible within the viewport, such as validation errors further down the page.

## In a section

Banners placed inside a section will have styles applied contextually. They're useful for conveying messages relevant to a specific section or piece of content.

## Best practices

* Seeing these banners can be stressful, so use them sparingly to avoid overwhelming users.
* Focus on a single piece of information or required action to avoid overwhelming users.
* Make the message concise and scannable. Users shouldn’t need to spend a lot of time figuring out what they need to know and do.
* Info, Warning and Critical banners should contain a call to action and clear next steps. Users should know what to do after seeing the banner.
* Avoid banners that can't be dismissed unless the user is required to take action.

## Content guidelines

* Keep titles concise and clear
* Limit body content to 1-2 sentences where possible
* Use action-led buttons with strong verbs (e.g., "Activate Apple Pay" not "Try Apple Pay")
* Avoid unnecessary words and articles in button text
* For warning and critical banners, explain how to resolve the issue

---
title: Banner
description: >-
  Highlights important information or required actions prominently within the
  interface. Use to communicate statuses, provide feedback, or draw attention to
  critical updates.
api_name: app-home
source_url:
  html: 'https://shopify.dev/docs/api/app-home/polaris-web-components/feedback/banner'
  md: >-
    https://shopify.dev/docs/api/app-home/polaris-web-components/feedback/banner.md
---

# Banner

Highlights important information or required actions prominently within the interface. Use to communicate statuses, provide feedback, or draw attention to critical updates.

## Properties

* dismissible

  boolean

  Default: false

  Determines whether the close button of the banner is present.

  When the close button is pressed, the `dismiss` event will fire, then `hidden` will be true, any animation will complete, and the `afterhide` event will fire.

* heading

  string

  Default: ''

  The title of the banner.

* hidden

  boolean

  Default: false

  Determines whether the banner is hidden.

  If this property is being set on each framework render (as in 'controlled' usage), and the banner is `dismissible`, ensure you update app state for this property when the `dismiss` event fires.

  If the banner is not `dismissible`, it can still be hidden by setting this property.

* tone

  "info" | "success" | "warning" | "critical" | "auto"

  Default: 'auto'

  Sets the tone of the Banner, based on the intention of the information being conveyed.

  The banner is a live region and the type of status will be dictated by the Tone selected.

  * `critical` creates an [assertive live region](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/alert_role) that is announced by screen readers immediately.
  * `neutral`, `info`, `success`, `warning` and `caution` creates an [informative live region](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/status_role) that is announced by screen readers after the current message.

## Events

Learn more about [registering events](https://shopify.dev/docs/api/app-home/using-polaris-components#event-handling).

* afterhide

  CallbackEventListener\<typeof tagName> | null

* dismiss

  CallbackEventListener\<typeof tagName> | null

### CallbackEventListener

```ts
(EventListener & {
      (event: CallbackEvent<T>): void;
    }) | null
```

### CallbackEvent

```ts
Event & {
  currentTarget: HTMLElementTagNameMap[T];
}
```

## Slots

* children

  HTMLElement

  The content of the Banner.

* secondary-actions

  HTMLElement

  The secondary actions to display at the bottom of the Banner.

  Only Buttons with the `variant` of "secondary" or "auto" are permitted. A maximum of two `s-button` components are allowed.

Examples

### Examples

* #### Code

  ##### jsx

  ```jsx
  <s-banner heading="Order archived" tone="info" dismissible>
    This order was archived on March 7, 2017 at 3:12pm EDT.
  </s-banner>
  ```

  ##### html

  ```html
  <s-banner heading="Order archived" tone="info" dismissible>
    This order was archived on March 7, 2017 at 3:12pm EDT.
  </s-banner>
  ```

* #### Basic information banner

  ##### Description

  Demonstrates a simple informational banner used to communicate status updates or completed actions, providing clear and concise feedback to the user.

  ##### jsx

  ```jsx
  <s-banner heading="Order archived">
    This order was archived on March 7, 2017 at 3:12pm EDT.
  </s-banner>
  ```

  ##### html

  ```html
  <s-banner heading="Order archived">
    This order was archived on March 7, 2017 at 3:12pm EDT.
  </s-banner>
  ```

* #### Warning banner with specific actions

  ##### Description

  Illustrates a warning banner that highlights a potential issue and provides actionable buttons to help users resolve the problem quickly and effectively.

  ##### jsx

  ```jsx
  <s-banner heading="127 products missing shipping weights" tone="warning">
    Products without weights may show inaccurate shipping rates, leading to
    checkout abandonment.
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/products?filter=missing-weights"
    >
      Review products
    </s-button>
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="javascript:void(0)"
    >
      Setup guide
    </s-button>
  </s-banner>
  ```

  ##### html

  ```html
  <s-banner heading="127 products missing shipping weights" tone="warning">
    Products without weights may show inaccurate shipping rates, leading to
    checkout abandonment.
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/products?filter=missing-weights"
    >
      Review products
    </s-button>
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="javascript:void(0)"
    >
      Setup guide
    </s-button>
  </s-banner>
  ```

* #### Critical banner with clear next steps

  ##### Description

  Demonstrates an urgent banner design that signals a critical issue requiring immediate action, with clear and prominent secondary action buttons to guide users.

  ##### jsx

  ```jsx
  <s-banner heading="Order #1024 flagged for fraud review" tone="critical">
    This order shows multiple risk indicators and cannot be auto-fulfilled. Review
    required within 24 hours to prevent automatic cancellation.
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/orders/1024/risk"
    >
      Review order details
    </s-button>
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/settings/payments/fraud"
    >
      Adjust fraud settings
    </s-button>
  </s-banner>
  ```

  ##### html

  ```html
  <s-banner heading="Order #1024 flagged for fraud review" tone="critical">
    This order shows multiple risk indicators and cannot be auto-fulfilled. Review
    required within 24 hours to prevent automatic cancellation.
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/orders/1024/risk"
    >
      Review order details
    </s-button>
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/settings/payments/fraud"
    >
      Adjust fraud settings
    </s-button>
  </s-banner>
  ```

* #### Dismissible success banner

  ##### Description

  Success confirmation with dismiss option for completed operations.

  ##### jsx

  ```jsx
  <s-banner heading="Products imported" tone="success" dismissible={true}>
    Successfully imported 50 products to your store.
  </s-banner>
  ```

  ##### html

  ```html
  <s-banner heading="Products imported" tone="success" dismissible="true">
    Successfully imported 50 products to your store.
  </s-banner>
  ```

* #### Info banner with clear value proposition

  ##### Description

  Informational banner highlighting app updates with clear benefits and actions.

  ##### jsx

  ```jsx
  <s-banner heading="Point of Sale v2.4 available" tone="info" dismissible>
    New version includes faster checkout processing and inventory sync
    improvements.
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/apps/pos/changelog"
    >
      View changes
    </s-button>
    <s-button slot="secondary-actions" variant="secondary">
      Install update
    </s-button>
  </s-banner>
  ```

  ##### html

  ```html
  <s-banner heading="Point of Sale v2.4 available" tone="info" dismissible>
    New version includes faster checkout processing and inventory sync
    improvements.
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/apps/pos/changelog"
    >
      View changes
    </s-button>
    <s-button slot="secondary-actions" variant="secondary">
      Install update
    </s-button>
  </s-banner>
  ```

## Useful for

* Showing important information or changes
* Prompting merchants to take a specific action
* Displaying warnings, errors, or critical information
* Communicating persistent conditions that need attention

## Outside of a section

Banners placed outside of a section will display in their own card and should be located at the top of the page. They're useful for conveying messages that apply to the entire page or areas not visible within the viewport, such as validation errors further down the page.

## In a section

Banners placed inside a section will have styles applied contextually. They're useful for conveying messages relevant to a specific section or piece of content.

## Best practices

* Seeing these banners can be stressful, so use them sparingly to avoid overwhelming users.
* Focus on a single piece of information or required action to avoid overwhelming users.
* Make the message concise and scannable. Users shouldn’t need to spend a lot of time figuring out what they need to know and do.
* Info, Warning and Critical banners should contain a call to action and clear next steps. Users should know what to do after seeing the banner.
* Avoid banners that can't be dismissed unless the user is required to take action.

## Content guidelines

* Keep titles concise and clear
* Limit body content to 1-2 sentences where possible
* Use action-led buttons with strong verbs (e.g., "Activate Apple Pay" not "Try Apple Pay")
* Avoid unnecessary words and articles in button text
* For warning and critical banners, explain how to resolve the issue


---
title: Banner
description: >-
  Highlights important information or required actions prominently within the
  interface. Use to communicate statuses, provide feedback, or draw attention to
  critical updates.
api_name: app-home
source_url:
  html: 'https://shopify.dev/docs/api/app-home/polaris-web-components/feedback/banner'
  md: >-
    https://shopify.dev/docs/api/app-home/polaris-web-components/feedback/banner.md
---

# Banner

Highlights important information or required actions prominently within the interface. Use to communicate statuses, provide feedback, or draw attention to critical updates.

## Properties

* dismissible

  boolean

  Default: false

  Determines whether the close button of the banner is present.

  When the close button is pressed, the `dismiss` event will fire, then `hidden` will be true, any animation will complete, and the `afterhide` event will fire.

* heading

  string

  Default: ''

  The title of the banner.

* hidden

  boolean

  Default: false

  Determines whether the banner is hidden.

  If this property is being set on each framework render (as in 'controlled' usage), and the banner is `dismissible`, ensure you update app state for this property when the `dismiss` event fires.

  If the banner is not `dismissible`, it can still be hidden by setting this property.

* tone

  "info" | "success" | "warning" | "critical" | "auto"

  Default: 'auto'

  Sets the tone of the Banner, based on the intention of the information being conveyed.

  The banner is a live region and the type of status will be dictated by the Tone selected.

  * `critical` creates an [assertive live region](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/alert_role) that is announced by screen readers immediately.
  * `neutral`, `info`, `success`, `warning` and `caution` creates an [informative live region](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/status_role) that is announced by screen readers after the current message.

## Events

Learn more about [registering events](https://shopify.dev/docs/api/app-home/using-polaris-components#event-handling).

* afterhide

  CallbackEventListener\<typeof tagName> | null

* dismiss

  CallbackEventListener\<typeof tagName> | null

### CallbackEventListener

```ts
(EventListener & {
      (event: CallbackEvent<T>): void;
    }) | null
```

### CallbackEvent

```ts
Event & {
  currentTarget: HTMLElementTagNameMap[T];
}
```

## Slots

* children

  HTMLElement

  The content of the Banner.

* secondary-actions

  HTMLElement

  The secondary actions to display at the bottom of the Banner.

  Only Buttons with the `variant` of "secondary" or "auto" are permitted. A maximum of two `s-button` components are allowed.

Examples

### Examples

* #### Code

  ##### jsx

  ```jsx
  <s-banner heading="Order archived" tone="info" dismissible>
    This order was archived on March 7, 2017 at 3:12pm EDT.
  </s-banner>
  ```

  ##### html

  ```html
  <s-banner heading="Order archived" tone="info" dismissible>
    This order was archived on March 7, 2017 at 3:12pm EDT.
  </s-banner>
  ```

* #### Basic information banner

  ##### Description

  Demonstrates a simple informational banner used to communicate status updates or completed actions, providing clear and concise feedback to the user.

  ##### jsx

  ```jsx
  <s-banner heading="Order archived">
    This order was archived on March 7, 2017 at 3:12pm EDT.
  </s-banner>
  ```

  ##### html

  ```html
  <s-banner heading="Order archived">
    This order was archived on March 7, 2017 at 3:12pm EDT.
  </s-banner>
  ```

* #### Warning banner with specific actions

  ##### Description

  Illustrates a warning banner that highlights a potential issue and provides actionable buttons to help users resolve the problem quickly and effectively.

  ##### jsx

  ```jsx
  <s-banner heading="127 products missing shipping weights" tone="warning">
    Products without weights may show inaccurate shipping rates, leading to
    checkout abandonment.
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/products?filter=missing-weights"
    >
      Review products
    </s-button>
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="javascript:void(0)"
    >
      Setup guide
    </s-button>
  </s-banner>
  ```

  ##### html

  ```html
  <s-banner heading="127 products missing shipping weights" tone="warning">
    Products without weights may show inaccurate shipping rates, leading to
    checkout abandonment.
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/products?filter=missing-weights"
    >
      Review products
    </s-button>
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="javascript:void(0)"
    >
      Setup guide
    </s-button>
  </s-banner>
  ```

* #### Critical banner with clear next steps

  ##### Description

  Demonstrates an urgent banner design that signals a critical issue requiring immediate action, with clear and prominent secondary action buttons to guide users.

  ##### jsx

  ```jsx
  <s-banner heading="Order #1024 flagged for fraud review" tone="critical">
    This order shows multiple risk indicators and cannot be auto-fulfilled. Review
    required within 24 hours to prevent automatic cancellation.
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/orders/1024/risk"
    >
      Review order details
    </s-button>
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/settings/payments/fraud"
    >
      Adjust fraud settings
    </s-button>
  </s-banner>
  ```

  ##### html

  ```html
  <s-banner heading="Order #1024 flagged for fraud review" tone="critical">
    This order shows multiple risk indicators and cannot be auto-fulfilled. Review
    required within 24 hours to prevent automatic cancellation.
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/orders/1024/risk"
    >
      Review order details
    </s-button>
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/settings/payments/fraud"
    >
      Adjust fraud settings
    </s-button>
  </s-banner>
  ```

* #### Dismissible success banner

  ##### Description

  Success confirmation with dismiss option for completed operations.

  ##### jsx

  ```jsx
  <s-banner heading="Products imported" tone="success" dismissible={true}>
    Successfully imported 50 products to your store.
  </s-banner>
  ```

  ##### html

  ```html
  <s-banner heading="Products imported" tone="success" dismissible="true">
    Successfully imported 50 products to your store.
  </s-banner>
  ```

* #### Info banner with clear value proposition

  ##### Description

  Informational banner highlighting app updates with clear benefits and actions.

  ##### jsx

  ```jsx
  <s-banner heading="Point of Sale v2.4 available" tone="info" dismissible>
    New version includes faster checkout processing and inventory sync
    improvements.
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/apps/pos/changelog"
    >
      View changes
    </s-button>
    <s-button slot="secondary-actions" variant="secondary">
      Install update
    </s-button>
  </s-banner>
  ```

  ##### html

  ```html
  <s-banner heading="Point of Sale v2.4 available" tone="info" dismissible>
    New version includes faster checkout processing and inventory sync
    improvements.
    <s-button
      slot="secondary-actions"
      variant="secondary"
      href="/admin/apps/pos/changelog"
    >
      View changes
    </s-button>
    <s-button slot="secondary-actions" variant="secondary">
      Install update
    </s-button>
  </s-banner>
  ```

## Useful for

* Showing important information or changes
* Prompting merchants to take a specific action
* Displaying warnings, errors, or critical information
* Communicating persistent conditions that need attention

## Outside of a section

Banners placed outside of a section will display in their own card and should be located at the top of the page. They're useful for conveying messages that apply to the entire page or areas not visible within the viewport, such as validation errors further down the page.

## In a section

Banners placed inside a section will have styles applied contextually. They're useful for conveying messages relevant to a specific section or piece of content.

## Best practices

* Seeing these banners can be stressful, so use them sparingly to avoid overwhelming users.
* Focus on a single piece of information or required action to avoid overwhelming users.
* Make the message concise and scannable. Users shouldn’t need to spend a lot of time figuring out what they need to know and do.
* Info, Warning and Critical banners should contain a call to action and clear next steps. Users should know what to do after seeing the banner.
* Avoid banners that can't be dismissed unless the user is required to take action.

## Content guidelines

* Keep titles concise and clear
* Limit body content to 1-2 sentences where possible
* Use action-led buttons with strong verbs (e.g., "Activate Apple Pay" not "Try Apple Pay")
* Avoid unnecessary words and articles in button text
* For warning and critical banners, explain how to resolve the issue


---
title: Empty state
description: >
  Empty states are used when a list, table, or chart has no items or data to
  show. This is an opportunity to provide explanation or guidance to help
  merchants progress. The empty state component is intended for use when a full
  page in the admin is empty, and not for individual elements or areas in the
  interface.

    | Used to | Examples |
    | --- | --- |
    | Offer a clear next step when no data is present | Prompt merchants to create their first campaign |
    | Encourage activation of features | Suggest setting up a subscription plan when none exist |
    ---
api_name: app-home
source_url:
  html: 'https://shopify.dev/docs/api/app-home/patterns/compositions/empty-state'
  md: 'https://shopify.dev/docs/api/app-home/patterns/compositions/empty-state.md'
---

# Empty state

Empty states are used when a list, table, or chart has no items or data to show. This is an opportunity to provide explanation or guidance to help merchants progress. The empty state component is intended for use when a full page in the admin is empty, and not for individual elements or areas in the interface.

| Used to | Examples |
| - | - |
| Offer a clear next step when no data is present | Prompt merchants to create their first campaign |
| Encourage activation of features | Suggest setting up a subscription plan when none exist |

***

Examples

### Examples

* #### Empty state

  ##### jsx

  ```jsx
  <s-section accessibilityLabel="Empty state section">
    <s-grid gap="base" justifyItems="center" paddingBlock="large-400">
      <s-box maxInlineSize="200px" maxBlockSize="200px">
        {/* aspectRatio should match the actual image dimensions (width/height) */}
        <s-image
          aspectRatio="1/0.5"
          src="https://cdn.shopify.com/static/images/polaris/patterns/callout.png"
          alt="A stylized graphic of four characters, each holding a puzzle piece"
        />
      </s-box>
      <s-grid justifyItems="center" maxInlineSize="450px" gap="base">
        <s-stack alignItems="center">
          <s-heading>Start creating puzzles</s-heading>
          <s-paragraph>
            Create and manage your collection of puzzles for players to enjoy.
          </s-paragraph>
        </s-stack>
        <s-button-group>
          <s-button
            slot="secondary-actions"
            aria-label="Learn more about creating puzzles"
          >
            {" "}
            Learn more{" "}
          </s-button>
          <s-button slot="primary-action" aria-label="Add a new puzzle">
            {" "}
            Create puzzle{" "}
          </s-button>
        </s-button-group>
      </s-grid>
    </s-grid>
  </s-section>
  ```

  ##### html

  ```html
  <s-section accessibilityLabel="Empty state section">
    <s-grid gap="base" justifyItems="center" paddingBlock="large-400">
      <s-box maxInlineSize="200px" maxBlockSize="200px">
        <!-- aspectRatio should match the actual image dimensions (width/height) -->
        <s-image
          aspectRatio="1/0.5"
          src="https://cdn.shopify.com/static/images/polaris/patterns/callout.png"
          alt="A stylized graphic of four characters, each holding a puzzle piece"
        />
      </s-box>
      <s-grid
        justifyItems="center"
        maxInlineSize="450px"
        gap="base"
      >
      <s-stack alignItems="center">
        <s-heading>Start creating puzzles</s-heading>
        <s-paragraph>
          Create and manage your collection of puzzles for players to enjoy.
        </s-paragraph>
      </s-stack>
      <s-button-group>
        <s-button slot="secondary-actions" aria-label="Learn more about creating puzzles"> Learn more </s-button>
        <s-button slot="primary-action" aria-label="Add a new puzzle"> Create puzzle </s-button>
      </s-button-group>
      </s-grid>
    </s-grid>
  </s-section>
  ```

## Related

[Requirements - Built for Shopify](https://shopify.dev/docs/apps/launch/built-for-shopify/requirements)