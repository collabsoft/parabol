import {GraphQLFloat, GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql'
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type'
import SuggestedActionTypeEnum from 'server/graphql/types/SuggestedActionTypeEnum'
import User from 'server/graphql/types/User'
import SuggestedActionCreateNewTeam from './SuggestedActionCreateNewTeam'
import SuggestedActionInviteYourTeam from './SuggestedActionInviteYourTeam'
import SuggestedActionTryActionMeeting from './SuggestedActionTryActionMeeting'
import SuggestedActionTryRetroMeeting from './SuggestedActionTryRetroMeeting'
import SuggestedActionTryTheDemo from './SuggestedActionTryTheDemo'

export const suggestedActionInterfaceFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'shortid'
  },
  createdAt: {
    type: new GraphQLNonNull(GraphQLISO8601Type),
    description: '* The timestamp the action was created at'
  },
  priority: {
    type: GraphQLFloat,
    description:
      'The priority of the suggested action compared to other suggested actions (smaller number is higher priority)'
  },
  removedAt: {
    type: new GraphQLNonNull(GraphQLISO8601Type),
    description: '* The timestamp the action was removed at'
  },
  suggestedActionType: {
    type: new GraphQLNonNull(SuggestedActionTypeEnum),
    description: 'The specific type of suggested action'
  },
  userId: {
    type: new GraphQLNonNull(GraphQLID),
    description: '* The userId this action is for'
  },
  user: {
    type: new GraphQLNonNull(User),
    description: 'The user than can see this event',
    resolve: ({userId}, _args, {dataLoader}) => {
      return dataLoader.get('users').load(userId)
    }
  }
})

const SuggestedAction = new GraphQLInterfaceType({
  name: 'SuggestedAction',
  description: 'A past event that is important to the viewer',
  fields: suggestedActionInterfaceFields,
  resolveType: (value) => {
    const resolveTypeLookup = {
      inviteYourTeam: SuggestedActionInviteYourTeam,
      tryTheDemo: SuggestedActionTryTheDemo,
      tryRetroMeeting: SuggestedActionTryRetroMeeting,
      tryActionMeeting: SuggestedActionTryActionMeeting,
      createNewTeam: SuggestedActionCreateNewTeam
    }

    return resolveTypeLookup[value.type]
  }
})

export default SuggestedAction
