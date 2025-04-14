import dispatcher from '../dispatcher/dispatcher';

export function addProperty(property: {
  id: string;
  name: string;
  price: number;
}) {
  dispatcher.dispatch({
    type: 'ADD_PROPERTY',
    property,
  });
}

export function removeProperty(propertyId: string) {
  dispatcher.dispatch({
    type: 'REMOVE_PROPERTY',
    propertyId,
  });
}
