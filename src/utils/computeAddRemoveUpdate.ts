import difference from 'lodash/difference';

type ID = string;

const formatId = (id: ID) => ({ id });

export const computeFieldsToAdd = (oldIds: [], newIds: []) => {
  const idsNew = newIds.map((v: { id: string }) => v.id);
  const idsOld = oldIds.map((v: { id: string }) => v.id);
  return difference(idsNew, idsOld).map(formatId);
};

export const computeFieldsToRemove = (oldIds: [], newIds: []) => {
  const idsNew = newIds.map((v: { id: string }) => v.id);
  const idsOld = oldIds.map((v: { id: string }) => v.id);
  return difference(idsOld, idsNew).map(formatId);
};

export const computeFieldsToUpdate = (oldIds: ID[], newIds: ID[]) => {
  return oldIds.filter((oldId) => newIds.includes(oldId)).map(formatId);
};

export const computeFieldsToAddRemoveUpdate = (oldIds: [], newIds: []) => ({
  fieldsToAdd: computeFieldsToAdd(oldIds, newIds),
  fieldsToRemove: computeFieldsToRemove(oldIds, newIds),
  fieldsToUpdate: computeFieldsToUpdate(oldIds, newIds),
});
