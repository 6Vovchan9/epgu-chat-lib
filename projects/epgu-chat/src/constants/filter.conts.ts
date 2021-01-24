import { FilterInterface } from '../interfaces/intarfaces';

export const overviewPageFilter: OverviewPageFilterInterface = {
  countSort: [
    {
      id: 1,
      value: 10,
      text: 'Отображать по 10',
    },
    {
      id: 2,
      value: 50,
      text: 'Отображать по 50',
    },
    {
      id: 3,
      value: 100,
      text: 'Отображать по 100',
    },
    {
      id: 4,
      value: 'all',
      text: 'Отображать все',
    },
  ],
  fieldSort: [
    {
      id: 1,
      value: 'ASC',
      text: 'По алфавиту А-Я',
    },
    {
      id: 2,
      value: 'cadaster',
      text: 'По кадастровому номеру',
    },
    {
      id: 3,
      value: 'houseDate',
      text: 'По добавлению дома',
    },
  ],
};

export interface OverviewPageFilterInterface {
  countSort: FilterInterface[];
  fieldSort: FilterInterface[];
}

export const adsPageFilter: AdsPageFilterInterface = {
  selectedRelevance: [
    {
      id: 1,
      value: 'isViewActive',
      text: 'Только актуальные',
    },
    {
      id: 2,
      value: 'isViewInactive',
      text: 'Только неактуальные',
    },
    {
      id: 3,
      value: 'all',
      text: 'Все',
    },
  ],
  selectedSort: [
    {
      id: 1,
      value: 'activityDate',
      text: 'По дате активности',
    },
    {
      id: 2,
      value: 'creationDate',
      text: 'По дате создания',
    },
  ],
};

export interface AdsPageFilterInterface {
  selectedRelevance: FilterInterface[];
  selectedSort: FilterInterface[];
}
