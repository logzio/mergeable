const UNKNOWN_INPUT_TYPE_ERROR = `Input type invalid, expected array of string as input`

class Required {
  static process (validatorContext, input, rule) {
    console.log('Required: ', rule.required)
    const filter = rule.required

    const reviewers = filter['reviewers'] ? filter['reviewers'] : []
    const owners = filter['owners'] ? filter['owners'] : []
    const assignees = filter['assignees'] ? filter['assignees'] : []
    let description = filter['message']
    let all = filter['all'] ? filter['all'] : false

    if (!Array.isArray(input)) {
      throw new Error(UNKNOWN_INPUT_TYPE_ERROR)
    }

    let isMergeable
    let defaultSuccessMessage
    if (all) {
      // go thru the required list and check against inputs
      let remainingRequired = new Map(reviewers.map(user => [user.toLowerCase(), user]))
      input.forEach(user => remainingRequired.delete(user.toLowerCase()))

      isMergeable = remainingRequired.size === 0

      const requiredReviewers = Array.from(remainingRequired.values()).map(user => {
        if (owners.includes(user)) {
          return user + '(Code Owner) '
        }
        if (assignees.includes(user)) {
          return user + '(Assignee) '
        }
        return user + ' '
      })

      defaultSuccessMessage = `${validatorContext.name}: all required reviewers have approved`
      if (!description) description = `${validatorContext.name}: ${requiredReviewers}required`
    } else {
      let allowedReviewersMap = new Map(reviewers.map(user => [user, user]))
      console.log('Allowed reviewers map: ', allowedReviewersMap)
      let notAllowedActualReviewers = []
      for (let i = 0; i < input.length; i++) {
        let actualReviewer = input[i]
        if (!allowedReviewersMap.has(actualReviewer)) {
          console.log('compare', actualReviewer, allowedReviewersMap)
          notAllowedActualReviewers.push(actualReviewer)
        }
      }
      isMergeable = notAllowedActualReviewers.length === 0
      defaultSuccessMessage = `${validatorContext.name}: all reviewers have approved and are part of the required reviewers list`
      if (!description) description = `${validatorContext.name}: the reviewers (${notAllowedActualReviewers}) are not part of allowed reviewers: ${reviewers}`
    }

    return {
      status: isMergeable ? 'pass' : 'fail',
      description: isMergeable ? defaultSuccessMessage : description
    }
  }
}

module.exports = Required
