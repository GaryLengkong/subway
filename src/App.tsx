import { Menu } from '@blueprintjs/core';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import {
  CopyCellsMenuItem,
  IMenuContext,
  SelectionModes,
  Table,
  Utils,
} from '@blueprintjs/table';
import '@blueprintjs/table/lib/css/table.css';
import 'normalize.css/normalize.css';
import * as React from 'react';
import SortableColumn, {ISortableColumn} from './SortableColumn';


const SUBWAY_URL = './subway.json';

class App extends React.PureComponent {
  public state = {
    columns: [
      new SortableColumn('Name', 0),
      new SortableColumn('Entries', 1),
      new SortableColumn('Exits', 2),
      new SortableColumn('Total', 3),
    ] as ISortableColumn[],
    data: [],
    sortedIndexMap: [] as number[],
  };
  
  public async componentDidMount() {
    const response = await fetch(SUBWAY_URL);
    const json = await response.json();
    const subwayData = json.subwayData;
    const stationByName = this.getStationByName(subwayData)
    const stations = []
    for (const name in stationByName) {
      if (stationByName.hasOwnProperty(name)) {
        stations.push(stationByName[name]);
      }
    }
    const data = stations.map((station) => {
      return [
        station.name,
        station.entries,
        station.exits,
        station.total
      ];
    });
    this.setState({data});
  }
  
  public render() {
    const numRows = this.state.data.length;
    const columns = this.state.columns.map(col => col.getColumn(this.getCellData, this.sortColumn));
    return (
      <Table
      bodyContextMenuRenderer={this.renderBodyContextMenu}
      numRows={numRows}
      selectionModes={SelectionModes.COLUMNS_AND_CELLS}
      >
      {columns}
      </Table>
    );
  }
  
  private getCellData = (rowIndex: number, columnIndex: number) => {
    const sortedRowIndex = this.state.sortedIndexMap[rowIndex];
    if (sortedRowIndex != null) {
      rowIndex = sortedRowIndex;
    }
    return this.state.data[rowIndex][columnIndex];
  };
  
  private renderBodyContextMenu = (context: IMenuContext) => {
    return (
      <Menu>
      <CopyCellsMenuItem context={context} getCellData={this.getCellData} text='Copy' />
      </Menu>
    );
  };
  
  private sortColumn = (columnIndex: number, comparator: (a: any, b: any) => number) => {
    const { data } = this.state;
    const sortedIndexMap = Utils.times(data.length, (i: number) => i);
    sortedIndexMap.sort((a: number, b: number) => {
      return comparator(data[a][columnIndex], data[b][columnIndex]);
    });
    this.setState({ sortedIndexMap });
  };
  
  private getStationByName(subwayData: any): any {
    return subwayData.reduce((stationByName: any, stationData: any) => {
      const name = stationData.STATION;
      const entries = parseInt(stationData.ENTRIES, 10);
      const exits = parseInt(stationData.EXITS, 10);
      const total = entries + exits;
      const station = stationByName[name]
      if (!station) {
        stationByName[name] = {
          entries,
          exits,
          name,
          total
        }
      } else {
        station.entries += entries;
        station.exits += exits;
        station.total += total;
      }
      return stationByName;
    }, {})
  }
}

export default App;
