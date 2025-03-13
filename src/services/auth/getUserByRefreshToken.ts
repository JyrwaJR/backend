import { prisma } from "@/lib/db";

type Props = {
  refreshToken: string;
};
export async function getUserByRefreshToken({ refreshToken }: Props) {
  return await prisma.auth.findUnique({
    where: {
      tokens: {
        some: {
          token: refreshToken,
          revokedAt: {
            equals: null,
          },
        },
      },
    },
    include: { user: true },
  });
}
