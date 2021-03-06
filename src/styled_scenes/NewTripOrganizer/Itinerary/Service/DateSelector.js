import 'react-dates.css'
import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types'
import styled from 'styled-components'
import moment from 'moment'
import { DayPickerRangeController } from 'react-dates'
import { START_DATE, END_DATE } from 'react-dates/constants'
import { minutesToDays } from 'libs/Utils'
import { TripContext } from '../../'
import { PSmall } from 'libs/commonStyles'
import { tertiary } from 'libs/colors'

const Text = styled(PSmall)`
  font-style: italic;
  color: ${tertiary};
  text-align: center;
`

const ServiceSettings = ({ service }) => {
  const [serviceStartDate, setServiceStartDate] = useState(null)
  const [serviceEndDate, setServiceEndDate] = useState(null)
  const [focusedInput, setFocusedInput] = useState(START_DATE)
  const { tripData, servicesByDay, changeServiceDays } = useContext(TripContext);
  const numberOfDays = minutesToDays(tripData.duration)
  const tripStartDate = moment(tripData.startDate)
  const tripEndDate = tripStartDate.clone().add(numberOfDays, 'days')

  useEffect(() => {
    let foundAll = false
    let currentDay = service.day
    while(!foundAll && currentDay < numberOfDays) {
      currentDay = currentDay + 1
      if (!servicesByDay[currentDay] || !servicesByDay[currentDay].find(s => s.service._id === service.service._id)) {
        foundAll = true
        currentDay = currentDay - 1
      }
    }
    let previousDay = service.day
    foundAll = false
    while(!foundAll && previousDay > 0) {
      previousDay = previousDay - 1
      if (!servicesByDay[previousDay] || !servicesByDay[previousDay].find(s => s.service._id === service.service._id)) {
        foundAll = true
        previousDay = previousDay - 1
      }
    }
    setServiceStartDate(tripStartDate.clone().add(previousDay + 1, 'days'))
    setServiceEndDate(tripStartDate.clone().add(currentDay, 'days'))
  }, [])

  const onDatesChange = ({ startDate, endDate }) => {
    if (focusedInput === START_DATE) {
      setServiceStartDate(startDate)
      setServiceEndDate(null)
      setFocusedInput(END_DATE)
      return
    }
    setServiceStartDate(startDate)
    setServiceEndDate(endDate)
    setFocusedInput(endDate ? START_DATE : END_DATE)

    if (startDate && endDate) {
      // we sum 1 to startDay so it's 1 instead of 0
      // not to end because it's supposed to be selected the checkout day, and we don't add the service to that day
      changeServiceDays(service, startDate.diff(tripStartDate, 'days') + 1, endDate.diff(tripStartDate, 'days'))
    }
  }

  const onFocusChange = () => {}

  const isOutsideRange = (day) => {
    return day.isBefore(tripStartDate, 'day') || day.isAfter(tripEndDate, 'day')
  }

  return (
    <>
      <DayPickerRangeController
        initialVisibleMonth={() => serviceStartDate || tripStartDate}
        onDatesChange={onDatesChange}
        onFocusChange={onFocusChange}
        focusedInput={focusedInput}
        startDate={serviceStartDate}
        endDate={serviceEndDate}
        isOutsideRange={isOutsideRange}
        daySize={35}
        hideKeyboardShortcutsPanel
        noBorder
      />
      <Text>Select check-in and check-out</Text>
    </>
  )
}

ServiceSettings.propTypes = {
  removeService: PropTypes.func.isRequired,
  service: PropTypes.object.isRequired,
}

export default ServiceSettings