import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, Image } from 'semantic-ui-react';

const AccountServicesScene = props => {
  return (
    <Grid centered columns={2}>
      <Grid.Column mobile={16} tablet={5} computer={4}>
        <h2>Service</h2>
      </Grid.Column>
      <Grid.Column mobile={16} tablet={11} computer={12}>
        <h2>Scene</h2>
      </Grid.Column>
    </Grid>
  );
};

AccountServicesScene.propTypes = {
  user: PropTypes.object,
};

export default AccountServicesScene;
