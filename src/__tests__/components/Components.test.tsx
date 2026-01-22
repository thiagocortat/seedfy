import React from 'react';
import renderer from 'react-test-renderer';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Typography } from '../../components/Typography';

describe('Components', () => {
  it('Card renders correctly', () => {
    const tree = renderer.create(
      <Card>
        <Typography>Test Content</Typography>
      </Card>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Button renders correctly', () => {
    const tree = renderer.create(
      <Button title="Click Me" onPress={() => {}} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Button renders loading state correctly', () => {
    const tree = renderer.create(
      <Button title="Loading" loading onPress={() => {}} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
