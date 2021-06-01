import { UseGuards } from '@nestjs/common';
import {
    Args,
    Int,
    Mutation,
    Parent,
    Query,
    ResolveField,
    Resolver,
} from '@nestjs/graphql';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GqlAnonymousGuard } from '../auth/guards/gql-anonymous.guard';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { User } from '../user/user.models';

import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import PostsLoaders from './posts.loader';
import { Post, RatingStatus } from './posts.models';
import { PostsService } from './posts.service';

@Resolver(() => Post)
export class PostsResolver {
    public constructor(
        private readonly postsService: PostsService,
        private readonly postsLoaders: PostsLoaders,
    ) {}

    @Query(() => Post, { nullable: true })
    @UseGuards(GqlAnonymousGuard)
    public async getPost(
        @Args('id', { type: () => Int }) id: number,
    ): Promise<Post> {
        return this.postsService.getPostById(id);
    }

    @Query(() => [Post])
    @UseGuards(GqlAnonymousGuard)
    public async getPosts(): Promise<Post[]> {
        return this.postsService.getPosts();
    }

    @Mutation(() => String)
    @UseGuards(GqlAuthGuard)
    public async createPost(
        @Args('input') input: CreatePostInput,
        @CurrentUser() user: User,
    ): Promise<string> {
        const userId = user.id;
        return this.postsService.createPost(input, userId);
    }

    @Mutation(() => String)
    @UseGuards(GqlAuthGuard)
    public async updatePost(
        @Args('id', { type: () => Int }) id: number,
        @Args('input') input: UpdatePostInput,
        @CurrentUser() user: User,
    ): Promise<string> {
        const userId = user.id;
        return this.postsService.updatePost(id, input, userId);
    }

    @Mutation(() => String)
    @UseGuards(GqlAuthGuard)
    public async deletePost(
        @Args('postId', { type: () => Int }) postId: number,
        @CurrentUser() user: User,
    ): Promise<string> {
        const userId = user.id;
        return this.postsService.deletePost(postId, userId);
    }

    @Mutation(() => String)
    @UseGuards(GqlAuthGuard)
    public async upvotePost(
        @Args('postId', { type: () => Int }) postId: number,
        @CurrentUser() user: User,
    ): Promise<string> {
        const userId = user.id;
        return this.postsService.changeRatingStatus(
            postId,
            userId,
            RatingStatus.upvoted,
        );
    }

    @Mutation(() => String)
    @UseGuards(GqlAuthGuard)
    public async downvotePost(
        @Args('postId', { type: () => Int }) postId: number,
        @CurrentUser() user: User,
    ): Promise<string> {
        const userId = user.id;
        return this.postsService.changeRatingStatus(
            postId,
            userId,
            RatingStatus.downvoted,
        );
    }

    @Mutation(() => String)
    @UseGuards(GqlAuthGuard)
    public async removeRatingFromPost(
        @Args('postId', { type: () => Int }) postId: number,
        @CurrentUser() user: User,
    ): Promise<string> {
        const userId = user.id;
        return this.postsService.changeRatingStatus(
            postId,
            userId,
            RatingStatus.neutral,
        );
    }

    @ResolveField('creator', () => User)
    public async getCreator(@Parent() post: Post): Promise<User> {
        const { creatorId } = post;
        return this.postsLoaders.batchCreators.load(creatorId);
    }

    @ResolveField('myRatingStatus', () => RatingStatus)
    public async getMyRatingStatus(
        @Parent() post: Post,
        @CurrentUser() user: User,
    ): Promise<string> {
        if (user.id) {
            const postId = post.id;
            const userId = user.id;
            return this.postsService.getMyRatingStatus(postId, userId);
        }
        return RatingStatus.neutral;
    }
}
