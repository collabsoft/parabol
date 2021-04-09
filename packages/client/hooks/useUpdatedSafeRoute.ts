import graphql from 'babel-plugin-relay/macro'
import {Dispatch, SetStateAction, useEffect, useRef} from 'react'
import {readInlineData} from 'relay-runtime'
import {useUpdatedSafeRoute_meeting} from '~/__generated__/useUpdatedSafeRoute_meeting.graphql'
import findStageBeforeId from '../utils/meetings/findStageBeforeId'
import findStageById from '../utils/meetings/findStageById'
import fromStageIdToUrl from '../utils/meetings/fromStageIdToUrl'
import updateLocalStage from '../utils/relay/updateLocalStage'
import useAtmosphere from './useAtmosphere'
import useRouter from './useRouter'

const useUpdatedSafeRoute = (setSafeRoute: Dispatch<SetStateAction<boolean>>, meetingRef: any) => {
  const {history} = useRouter()
  const meeting = readInlineData<useUpdatedSafeRoute_meeting>(
    graphql`
      fragment useUpdatedSafeRoute_meeting on NewMeeting @inline {
        ...fromStageIdToUrl_meeting
        id
        localStage {
          id
        }
        localPhase {
          id
          stages {
            id
          }
        }
        facilitatorStageId
        phases {
          id
          stages {
            id
          }
        }
      }
    `,
    meetingRef
  )
  const oldMeetingRef = useRef(meeting)
  const atmosphere = useAtmosphere()
  useEffect(() => {
    const {current: oldMeeting} = oldMeetingRef
    if (meeting === oldMeeting) {
      // required. repro: enter meeting, click to team dash, go back to meeting
      setSafeRoute(true)
      return
    }
    const {id: meetingId, localStage, localPhase, facilitatorStageId, phases} = meeting
    const localStages = localPhase?.stages ?? null
    const localStageId = localStage?.id ?? null
    const oldLocalStages = oldMeeting?.localPhase?.stages ?? null
    const oldLocalStageId = oldMeeting?.localStage?.id
    oldMeetingRef.current = meeting
    // if the stage changes or the order of the stages changes, update the url
    const isNewLocalStageId = localStageId && localStageId !== oldLocalStageId
    const isUpdatedPhase = localStages !== oldLocalStages
    let stageId = facilitatorStageId
    if (isNewLocalStageId || isUpdatedPhase) {
      if (isUpdatedPhase && !findStageById(phases, localStageId)) {
        // an item was removed and the local stage may be missing
        const tatorStageExists = findStageById(phases, facilitatorStageId)
        if (!tatorStageExists) {
          const prevStage = findStageBeforeId(oldMeeting.phases, localStageId)
          const prevStageId = prevStage?.stage.id
          if (prevStageId) stageId = prevStageId
        }
        updateLocalStage(atmosphere, meetingId, stageId)
      }
      const nextPathname = fromStageIdToUrl(localStageId, meeting, stageId)
      if (nextPathname !== location.pathname) {
        history.replace(nextPathname)
        // do not set as unsafe (repro: start meeting, end, start again)
        return
      }
    }
    setSafeRoute(true)
  })
}

export default useUpdatedSafeRoute
