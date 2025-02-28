import { collections, nfts, posts, users } from "@/lib/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, lt, sql } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const nftRouter = createTRPCRouter({
  mintPostAsNFT: protectedProcedure
    .input(z.object({
      postId: z.number(),
      collectionId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.query.posts.findFirst({
        where: eq(posts.id, input.postId),
        with: {
          author: true,
        },
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      if (post.authorId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only mint your own posts" });
      }

      const existingNFT = await ctx.db.query.nfts.findFirst({
        where: eq(nfts.postId, post.id),
      });

      if (existingNFT) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This post has already been minted as an NFT"
        });
      }

      let targetCollectionId = input.collectionId;

      if (!targetCollectionId) {
        const [defaultCollection] = await ctx.db
          .insert(collections)
          .values({
            name: `${ctx.session.user.username}'s Posts`,
            symbol: "POST",
            description: "Collection of posts minted as NFTs",
            creatorId: ctx.session.user.id,
          })
          .returning();

        targetCollectionId = defaultCollection.id;
      }

      const [collection] = await ctx.db
        .select({ totalSupply: collections.totalSupply })
        .from(collections)
        .where(eq(collections.id, targetCollectionId));

      const nextTokenId = (collection?.totalSupply ?? 0) + 1;

      const metadata = {
        name: `Post #${nextTokenId}`,
        description: post.content,
        image: post.image,
        attributes: {
          createdAt: post.createdAt,
          author: post.author.username,
        }
      };

      await ctx.db.insert(nfts).values({
        postId: post.id,
        collectionId: targetCollectionId,
        tokenId: nextTokenId,
        metadata,
        owner: ctx.session.user.address,
      });

      await ctx.db
        .update(collections)
        .set({ totalSupply: nextTokenId })
        .where(eq(collections.id, targetCollectionId));

      return {
        success: true,
        tokenId: nextTokenId,
        collectionId: targetCollectionId,
      };
    }),

  getMyNFTs: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.nfts.findMany({
      where: eq(nfts.owner, ctx.session.user.address),
      with: {
        collection: true,
      },
      orderBy: (nfts, { desc }) => [desc(nfts.createdAt)],
    });
  }),

  getCollectionNFTs: protectedProcedure
    .input(z.object({
      collectionId: z.number(),
      cursor: z.number().nullish(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.query.nfts.findMany({
        where: and(
          eq(nfts.collectionId, input.collectionId),
          input.cursor ? lt(nfts.id, input.cursor) : undefined
        ),
        with: {
          post: {
            with: {
              author: true,
            },
          },
        },
        limit: input.limit + 1,
        orderBy: [desc(nfts.id)],
      });

      let nextCursor: typeof input.cursor = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  getCollections: protectedProcedure
    .input(z.object({
      type: z.enum(["all", "my"]),
      limit: z.number().min(1).max(100).default(50),
      cursor: z.number().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.db
        .select({
          id: collections.id,
          name: collections.name,
          symbol: collections.symbol,
          description: collections.description,
          baseUri: collections.baseUri,
          createdAt: collections.createdAt,
          updatedAt: collections.updatedAt,
          totalSupply: collections.totalSupply,
          creatorId: collections.creatorId,
          creator: {
            id: users.id,
            username: users.username,
            image: users.image,
          },
          nftsCount: sql<number>`COUNT(${nfts.id})`.as("nfts_count"),
        })
        .from(collections)
        .innerJoin(users, eq(collections.creatorId, users.id))
        .leftJoin(nfts, eq(collections.id, nfts.collectionId))
        .groupBy(collections.id, users.id, users.username, users.image)
        .where(and(
          input.type === "my"
            ? eq(collections.creatorId, ctx.session.user.id)
            : undefined,
          input.cursor
            ? lt(collections.id, input.cursor)
            : undefined,
        ))
        .orderBy(desc(collections.createdAt))
        .limit(input.limit + 1);

      let nextCursor: typeof input.cursor = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  getCollectionById: protectedProcedure
    .input(z.object({
      collectionId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const [collection] = await ctx.db.select({
        id: collections.id,
        name: collections.name,
        symbol: collections.symbol,
        description: collections.description,
        baseUri: collections.baseUri,
        creator: {
          id: users.id,
          username: users.username,
          image: users.image,
        },
        nftsCount: sql<number>`COUNT(${nfts.id})`.as("nfts_count"),
      })
        .from(collections)
        .where(eq(collections.id, input.collectionId))
        .innerJoin(users, eq(collections.creatorId, users.id))
        .leftJoin(nfts, eq(collections.id, nfts.collectionId))
        .groupBy(collections.id, users.id, users.username, users.image)
        .orderBy(desc(collections.createdAt));

      if (!collection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Collection not found",
        });
      }

      return collection;
    }),

  createCollection: protectedProcedure
    .input(z.object({
      name: z.string().min(3).max(255),
      symbol: z.string().min(2).max(10),
      description: z.string().max(1000).nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.insert(collections).values({
        name: input.name,
        symbol: input.symbol.toUpperCase(),
        description: input.description,
        creatorId: ctx.session.user.id,
      }).returning();
    }),

  updateCollection: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(3).max(255),
      symbol: z.string().min(2).max(10),
      description: z.string().max(1000).nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const collection = await ctx.db.query.collections.findFirst({
        where: eq(collections.id, input.id),
      });

      if (!collection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Collection not found",
        });
      }

      if (collection.creatorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to edit this collection",
        });
      }

      return await ctx.db.update(collections)
        .set({
          name: input.name,
          symbol: input.symbol.toUpperCase(),
          description: input.description,
          updatedAt: new Date(),
        })
        .where(eq(collections.id, input.id))
        .returning();
    }),

  getUserCollections: protectedProcedure
    .input(z.object({
      userId: z.number(),
      cursor: z.number().nullish(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.query.collections.findMany({
        where: and(
          eq(collections.creatorId, input.userId),
          input.cursor ? lt(collections.id, input.cursor) : undefined,
        ),
        limit: input.limit + 1,
        orderBy: [desc(collections.createdAt)],
        with: {
          creator: true,
        },
      });

      let nextCursor: typeof input.cursor = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
        nextCursor,
      };
    }),
}); 