import React, { useState, useEffect, useContext, useReducer } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Popup } from 'semantic-ui-react';
import GoogleMapReact from 'google-map-react';
import uniqBy from 'lodash.uniqby';
import { waitUntilMapsLoaded } from 'libs/Utils';
import { mapDaysToServices } from 'styled_scenes/Trip/mapServicesToDays';
import { getFromCoordinates } from 'libs/Utils';
import { primary } from 'libs/colors';
import { TripContext } from '../../';
import throttle from 'lodash.throttle';
import { Settings } from 'shared_components/icons';
import MapMarker from './MapMarker';
import Filters from './Filters';
import { generateDaysArray } from '../';

const topMargin = 70 + 66; // header + options
const bottomMargin = 70;

const wrapperStyles = props => `
  display: ${props.display};
  order: 1;
  width: 50vw;
  height: calc(100vh - ${topMargin + bottomMargin}px);
  position: relative;
`;

const Wrapper = styled.div`
  ${wrapperStyles} z-index: 1;

  ${props =>
    props.fixed &&
    `
    position: fixed;
    top: ${topMargin}px;
    right: 0;
  `};
`;

const WrapperPlaceholder = styled.div`
  ${wrapperStyles};
`;

const FiltersButton = styled.div`
  z-index: 2;
  position: absolute;
  left: 10px;
  top: 10px;
  background-color: white;
  border-radius: 5px 5px 5px 0;
  width: 40px;
  height: 40px;
  color: ${primary};
  font-size: 30px;
  justify-content: center;
  align-items: center;
  display: flex;
  cursor: pointer;
`;

function getMarkerProps(marker, i) {
  if (marker.service) {
    return {
      type: 'service',
      service: marker.service,
    };
  }
  if (i === 0) {
    return {
      type: 'initial',
      coordinates: marker,
    };
  }

  return {
    type: 'finish',
    coordinates: marker,
  };
}

const isAccommodation = service =>
  service.categories.find(category => category.names['en-us'] === 'Accommodation');
const isActivity = service =>
  service.categories.find(category => category.names['en-us'] === 'Activity');
const isFood = service => service.categories.find(category => category.names['en-us'] === 'Food');

const Map = ({ showingMap, servicesByDay, numberOfDays }) => {
  const { tripData } = useContext(TripContext);
  const startLocation =
    tripData.userStartLocation &&
    tripData.userStartLocation.geo &&
    tripData.userStartLocation.geo.coordinates;
  const endLocation =
    tripData.userEndLocation &&
    tripData.userEndLocation.geo &&
    tripData.userEndLocation.geo.coordinates;

  const [isFixed, setFixed] = useState(false);
  const [zoom, setZoom] = useState(11);
  const [services, setServices] = useState(
    uniqBy(mapDaysToServices(servicesByDay), service => service.service._id),
  );
  const [isShowingFilters, setShowFilters] = useState(0);

  const mapStartLocation = getFromCoordinates(
    startLocation || (services[0] && services[0].service.location.geo.coordinates),
  );
  const [center, setCenter] = useState(mapStartLocation);

  const getMarkers = () => [
    ...(startLocation ? [getFromCoordinates(startLocation)] : []),
    ...services.map(service => ({
      ...getFromCoordinates(service.service.location.geo.coordinates),
      key: service.service._id,
      service,
    })),
    ...(endLocation ? [getFromCoordinates(endLocation)] : []),
  ];

  const [markers, setMarkers] = useState(getMarkers());

  const [filters, setFilters] = useState({
    accommodation: true,
    activity: true,
    food: true,
    days: generateDaysArray(numberOfDays).map(_ => true),
  });

  useEffect(
    () => {
      const newMarkers = getMarkers();
      setMarkers(
        newMarkers.filter(marker => {
          if (!marker.service) {
            return true;
          }

          if (!filters.accommodation && isAccommodation(marker.service.service)) {
            return false;
          }

          if (!filters.activity && isActivity(marker.service.service)) {
            return false;
          }

          if (!filters.food && isFood(marker.service.service)) {
            return false;
          }

          if (!filters.days[marker.service.day - 1]) {
            return false;
          }

          return true;
        }),
      );
    },
    [filters],
  );

  useEffect(
    () => {
      setMarkers([getFromCoordinates(startLocation), ...markers.slice(1)]);
    },
    [tripData.userStartLocation],
  );

  useEffect(
    () => {
      setMarkers([...markers.slice(0, markers.length - 1), getFromCoordinates(endLocation)]);
    },
    [tripData.userEndLocation],
  );

  useEffect(
    () => {
      const handleScroll = () => {
        const fullHeight = document.body.scrollHeight;
        const scrolled = window.scrollY;

        if (!isFixed) {
          if (scrolled >= topMargin) {
            setFixed(true);
            return;
          }
          return;
        }
        if (isFixed) {
          if (scrolled < topMargin) {
            setFixed(false);
            return;
          }
          return;
        }

        if (scrolled + window.innerHeight < fullHeight - 105) {
          setFixed(true);
          return;
        }
      };

      const handleScrollThrottle = throttle(handleScroll, 10);

      window.addEventListener('scroll', handleScrollThrottle);
      return () => {
        window.removeEventListener('scroll', handleScrollThrottle);
      };
    },
    [isFixed],
  );

  const display = showingMap ? 'block' : 'none';

  return (
    <>
      <Wrapper display={display} fixed={isFixed}>
        <Popup
          trigger={
            <FiltersButton>
              <Settings />
            </FiltersButton>
          }
          content={
            <Filters defaultFilters={filters} setFilters={setFilters} numberOfDays={numberOfDays} />
          }
          flowing
          on="click"
          position="right center"
        />
        <GoogleMapReact
          center={center}
          zoom={zoom}
          bootstrapURLKeys={{
            key: 'AIzaSyBzMYIINQ6uNANLfPeuZn5ZJlz-8pmPjvc',
          }}
          googleMapLoader={waitUntilMapsLoaded}
          options={
            window.google
              ? {
                  zoomControlOptions: {
                    position: window.google.maps.ControlPosition.LEFT_CENTER,
                  },
                }
              : {}
          }
        >
          {markers.map((marker, i) => (
            <MapMarker {...marker} {...getMarkerProps(marker, i)} scale={1} />
          ))}
        </GoogleMapReact>
      </Wrapper>
      {isFixed && <WrapperPlaceholder display={display} />}
    </>
  );
};

Map.propTypes = {
  display: PropTypes.bool,
};

Map.defaultProps = {
  display: false,
};

export default Map;
