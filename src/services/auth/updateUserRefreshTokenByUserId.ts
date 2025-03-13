import { prisma } from "@/lib/db";

type Props = {
  userId: string;
  refreshToken: string;
  revoked: boolean;
};

export async function updateUserRefreshTokenByUserId({
  refreshToken,
  userId: id,
  revoked,
}: Props) {
  return await prisma.token.update({
    where: { authId: id, token: refreshToken },
    data: {
      revokedAt: revoked ? new Date() : null,
    },
  });
}
