import { Field, ObjectType } from '@nestjs/graphql';

import { MutationPayload } from '../../common/graphql/interfaces/mutation-payload';
import { UserError } from '../../common/graphql/types/user-error';
import { Comment } from '../comments.models';

@ObjectType({ implements: () => [MutationPayload] })
export class NewReplyPayload implements MutationPayload {
    @Field(() => [UserError])
    public errors!: UserError[];

    @Field(() => Comment, { nullable: true })
    public comment?: Comment;
}
