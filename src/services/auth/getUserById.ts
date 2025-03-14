import { prisma } from "@/lib/db";

type Props = {
  userId: string;
};
export async function getUserById({ userId }: Props) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      auth: {
        omit: { password: true, userId: true },
      },
    },
  });
}
