import { FilterInterface } from '../interfaces/intarfaces';
import { FilterPlaceHolderEnum } from '../enums/filter.enum';

export const overviewPageFilter: MainFilterInterface = {
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
  placeholder: FilterPlaceHolderEnum.OverviewPlaceholderFilter,
};

export const emNumbersPageFilter: MainFilterInterface = {
  countSort: overviewPageFilter.countSort,
  fieldSort: [
    {
      id: 1,
      value: 'ASC',
      text: 'По алфавиту А-Я',
    },
    {
      id: 2,
      value: 'phone',
      text: 'По номеру телефона',
    },
  ],
  placeholder: FilterPlaceHolderEnum.EmNumbersPlaceholderFilter,
};

export const adsPageFilter: MainFilterInterface = {
  countSort: overviewPageFilter.countSort,
  fieldSort: [
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
  placeholder: FilterPlaceHolderEnum.AdsPlaceholderFilter,
};

export interface MainFilterInterface {
  countSort: FilterInterface[];
  fieldSort: FilterInterface[];
  placeholder: FilterPlaceHolderEnum;
}
