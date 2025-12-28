import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
        // Default environment variables: AUTH_GITHUB_ID, AUTH_GITHUB_SECRET
        authorization: {
          params: {
            scope: 'read:user repo',
          },
        },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider.
      // Note: This token is accessible in the client, so use with caution.
      // We need it for isomorphic-git (client-side) and simple-git (server-side via API).
      if (token.accessToken) {
         session.accessToken = token.accessToken as string
      }
      return session
    },
  },
})
