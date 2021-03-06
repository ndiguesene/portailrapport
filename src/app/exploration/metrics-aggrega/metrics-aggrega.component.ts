import { MetricsService } from './../../services/metrics.service';
import { AggregationData } from './../../entities/aggregationData';
import { Component, OnInit, Input , EventEmitter, Output} from '@angular/core';
import { ElasticsearchService } from '../../services/elasticsearch.service';
import * as bodybuilder from 'bodybuilder';
import { BucketsService } from '../../services/buckets.service';

@Component({
  selector: 'app-metrics-aggrega',
  templateUrl: './metrics-aggrega.component.html',
  styleUrls: ['./metrics-aggrega.component.css']
})
export class MetricsAggregaComponent implements OnInit {
  @Output()
  change: EventEmitter<any> = new EventEmitter<any>();
  @Output()
  changeRemoveComposant: EventEmitter<number> = new EventEmitter<number>();
  resultatFiltre: Promise<any>;

  @Input()
  index: string;
  @Input()
  idComposant: number;
  @Input()
  hiddenButRemove: boolean;

  listFieldString: string[];
  listFieldNumber: string[];
  listFieldDate: string[];
  listFieldStringAll: string[];

  typeChampSelected = '';

  listeIndex: Promise<any>;

  /**
   * Ce champ permet de déterminer quel champ a été choisit pour le filtre metrics
   * (avg, sum, min, max ... sauf le count)
   */
  fieldMetricsChoice = '';
  typeOfaggregationSwtich = '';

  listeOperationsMetrics = this.metricsAgg.listeOperationsMetrics;
  listeBuckets = this.buck.listeBuckets;
  /**
   * Ce champ permet de filtrer la liste des champ qui va etre afficher
   * soit de type number(integer, float, long ...), string, text
   */
  constructor(private es: ElasticsearchService,
              private metricsAgg: MetricsService,
              private buck: BucketsService) { }

  async ngOnInit() {
    await this.loadListFieldOnView(this.index);
  }
  selectFieldMetricsChoice(event: any) {
    if (event) {
      this.fieldMetricsChoice = event.target.value;
    }
  }
  selectTypeOfAggregationSwtich(event: any) {
    if (event) {
      this.typeOfaggregationSwtich = event.target.value;
      // if (this.typeOfaggregationSwtich === 'count') {
      //   this.selectFieldForAggregationAndBucket = false;
      // } else {
      //   this.selectFieldForAggregationAndBucket = true;
      // }
    }
  }
  async loadListFieldOnView(index: string) {
    let type;
    // this.loading = false;
    /**
     * On applique un 'await' a l'instruction pour demander au programme de ne poursuivre
     * que si l'exécution est terminée
     */
    await this.es.getNameType(index).then(re => type = re);
    await this.es.getAllFieldsByIndexService(index, type).then(
      res => {
        // this.extractAllFieldJSON(this.listFieldString);
        this.listFieldStringAll = res[index].mappings;
        /**
         * Cette instruction en bas permet de recupérer la liste des clé de l'objets
         * qui constituer la liste de mes champs de l'index choisi
         */
        this.listFieldStringAll = Object.keys(this.listFieldStringAll[type]);
        // Ici on applique un filtre pour ne sélectionner que les champs qui nous intéressent
        // en enlevant les champs commencant par '_' et terminant par .keyword
        this.listFieldStringAll = this.listFieldStringAll.filter(
          el => (!el.startsWith('_')) && (!el.endsWith('.keyword')
          && (el !== '_index') && (el !== '_type') && (el !== '_id'))
        ).sort();

        this.es.getIndexTextFields(index).then(
          // tslint:disable-next-line:no-shadowed-variable
          res => this.listFieldString = res
        );
        /**
         * On recupere la liste des types des champs
         */
        this.es.getIndexNumFields(index).then(
          respp => this.listFieldNumber = respp
        );
        this.es.getIndexDateFields(index).then(
          resp => this.listFieldDate = resp
        );
        // this.loading = true;
      }
    );
    // this.contentArray = this.listFieldStringAll.map(
    //   (field: string, i: number) => field
    // );
    // this.returnedArray = this.contentArray.slice(0, this.nombreItemShowForPaggination);
  }
  resultatAggregat(typeOfaggregationSwtich: string) {
    if (this.fieldMetricsChoice === '') {
      this.fieldMetricsChoice = this.listFieldNumber[0];
    }
    const _query = bodybuilder().aggregation(
      typeOfaggregationSwtich, this.fieldMetricsChoice
    ).build();
    const agg = new AggregationData();
    agg.type = typeOfaggregationSwtich;
    agg.enabled = true;
    agg.schema = 'metric';
    agg.id = '';
    agg.params = {
      field: this.fieldMetricsChoice,
      query: _query
    };

    this.es.getSearchWithAgg(this.index, _query).then(
      res => {
        this.resultatFiltre = this.metricsAgg._getAggResult(res, agg);
        this.change.emit(this.resultatFiltre);
      }
    );
  }
  // ajoutNewMetricsAggregat() {
  //   alert('AJout');
  // }
  removeMetricsAggregat() {
    this.changeRemoveComposant.emit(this.idComposant);
  }

}
