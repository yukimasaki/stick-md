import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
        // Default environment variables: AUTH_GITHUB_ID, AUTH_GITHUB_SECRET
        authorization: {
          params: {
            scope: 'read:user repo user:email',
          },
        },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
        
        // アクセストークンを使用してGitHub APIからemailを取得
        // profile.emailがnullの場合でも、APIから取得できる
        if (account.access_token && !token.email) {
          try {
            // /userエンドポイントからemailを取得
            const userResponse = await fetch('https://api.github.com/user', {
              headers: {
                'Authorization': `Bearer ${account.access_token}`,
                'Accept': 'application/vnd.github.v3+json',
              },
            });
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              // emailがnullの場合は、/user/emailsエンドポイントから取得
              if (userData.email) {
                token.email = userData.email;
              } else {
                try {
                  const emailsResponse = await fetch('https://api.github.com/user/emails', {
                    headers: {
                      'Authorization': `Bearer ${account.access_token}`,
                      'Accept': 'application/vnd.github.v3+json',
                    },
                  });
                  
                  if (emailsResponse.ok) {
                    const emails: Array<{ email: string; primary: boolean; verified: boolean }> = await emailsResponse.json();
                    const primaryEmail = emails.find((e) => e.primary && e.verified);
                    token.email = primaryEmail?.email || emails.find((e) => e.verified)?.email || emails[0]?.email || null;
                  }
                } catch {
                  // email取得に失敗した場合はnullのまま
                }
              }
              
              // nameも取得
              if (userData.name) {
                token.name = userData.name;
              } else if (userData.login) {
                token.name = userData.login;
              }
            }
          } catch {
            // API呼び出しに失敗した場合は、profileから取得を試みる
            if (profile?.email) {
              token.email = profile.email;
            }
            if (profile?.name) {
              token.name = profile.name;
            }
          }
        }
      }
      
      // 既存のトークンにemail/nameがない場合、profileから取得を試みる
      if (!token.email && profile?.email) {
        token.email = profile.email;
      }
      if (!token.name && profile?.name) {
        token.name = profile.name;
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
      // トークンからemailとnameをセッションに含める
      if (token.email && session.user) {
        session.user.email = token.email as string
      }
      if (token.name && session.user) {
        session.user.name = token.name as string
      }
      return session
    },
  },
})
