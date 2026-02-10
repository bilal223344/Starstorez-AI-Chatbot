import { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(
    `#graphql
    query AccessScopeList {
      currentAppInstallation {
        accessScopes {
          handle
        }
      }
    }`,
  );

  const responseJson = await response.json();

  return responseJson.data;
};
