import { ElasticsearchService } from './elasticsearch.service';
import { Injectable } from '@angular/core';
import * as bodybuilder from 'bodybuilder';

@Injectable()
export class BucketsService {
  listeBuckets = [
    {key: 'null', value: 'Nom Bucket'},
    /**
     * Uniquement appliqué aux champs date
     */
    {key: 'date_histogram', value: 'Date Histogram Aggregation'},
    {key: 'date_range', value: 'Date Range Aggregation'},
    {key: 'range_aggregation', value: 'Range Aggregation'},
    {key: 'histogram', value: 'Histogram'},
    {key: 'filter_aggregation', value: 'Filter Aggregation'},
  ];

  constructor(private es: ElasticsearchService) { }
  /**
   *
   * @param _index l'index auquel les données seront puisées
   * @param _fieldDate le champs de type date qu'on va utilisé
   * @param _valueInterval La valeur de l'intervale en jour, mois ou année
   * @param _typeInterval le type de l'interval soit en 'jour',mois' ou 'année'
   * @param _format el format de la date (Ex: "yyyy-MM-dd")
   */
  queryDateHistoGrammAggregation(
        _index: string,
        _query: any): any {
    /**
     * Le 'field' doit etre de type 'Date'
     */
    return this.es.getSearchWithAgg(_index, _query);
  }
  queryDateRangeAggregation(_index: string, _query: any, _format?: string): any {
  /**
   * Le 'field' doit etre de type 'Date'
   */
    return this.es.getSearchWithAgg(_index, _query);
  }
  getResultFilterAggregationBucket(response: any): any {
    const nameAggregation = Object.keys(response.aggregations)[0];
    const aggResponse =
      (response.aggregations) ? response.aggregations[nameAggregation] : response[nameAggregation] || null;
    if (aggResponse['buckets']) {
      return aggResponse['buckets'];
    } else {
      return null;
    }
  }
  getResultFilterHitsBucket(response: any): any {
    if (response.hits.hits) {
      return response.hits.hits;
    } else {
      return null;
    }
  }
  // private _getAggregationResultBuckets(response: any): any[] {
  //   return [{
  //     label: 'Count',
  //     result: (response.hits) ? response.hits.total : response.doc_count || '--'
  //   }];
  // }
}
