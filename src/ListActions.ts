import uuid from 'uuid'

export const CreateListActions = (dispatch) => ({
  addNewIdea: (ideaTitle: string) => dispatch(appState => ({
    ideas: [...appState.ideas, { id: uuid.v4(), title: ideaTitle }]
  })),
  split: (itemIndex, offset) => dispatch(appState => {
    const { ideas } = appState
    const ideaToSplit = ideas[itemIndex]
    const newIdea1Title = ideaToSplit.title.slice(0, offset)
    const newIdea2Title = ideaToSplit.title.slice(offset)
    return {
      ideas: [
        ...ideas.slice(0, itemIndex),
        { id: ideaToSplit.id, title: newIdea1Title },
        { id: uuid.v4(), title: newIdea2Title },
        ...ideas.slice(itemIndex+1)
      ]
    }
  }),
  mergeIdeasInRange: (start, end) => dispatch(appState => {
    const { ideas } = appState
    const ideasToMerge = ideas.slice(start, end+1)

    const newIdeaTitle = ideasToMerge
      .map(idea => idea.title)
      .reduce((title, nextTitle) => title + "\n" + nextTitle)

    return {
      ideas: [
        ...ideas.slice(0, start),
        { id: ideasToMerge[0].id, title: newIdeaTitle },
        ...ideas.slice(end+1)
      ]
    }
  })
})