import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
} from '@material-ui/core';
import * as React from 'react';

const SUBWAY_URL = './subway.json';
const numberFormatter = new Intl.NumberFormat();

type Direction = 'asc' | 'desc';

interface IStation {
  entries: number;
  exits: number;
  name: string;
  total: number;
}

interface IAppState {
  stations: IStation[];
  sortBy: string;
  direction: Direction;
}

class App extends React.Component<{}, IAppState> {

  constructor(props: any) {
    super(props);
    this.state = {
      direction: 'desc',
      sortBy: 'total',
      stations: [],
    };
  }

  public getStationByName(subwayData: any): any {
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

  public async componentDidMount() {
    const response = await fetch(SUBWAY_URL);
    const data = await response.json();
    const subwayData = data.subwayData;
    const stationByName = this.getStationByName(subwayData)
    const stations = []
    for (const name in stationByName) {
      if (stationByName.hasOwnProperty(name)) {
        stations.push(stationByName[name]);
      }
    }
    this.setState({stations});
  }

  public renderTableHeaderCell(title: string, property: string, numeric: boolean) {
    const {sortBy, direction} = this.state;
    return (
      <TableCell
        numeric={numeric}
        sortDirection={sortBy === property ? direction : false}
      >
        <Tooltip
          title="Sort"
          placement={numeric ? 'bottom-end' : 'bottom-start'}
          enterDelay={300}
          >
            <TableSortLabel
              active={sortBy === property}
              direction={direction}
              onClick={this.handleSortChange(property)}
              >
                {title}
              </TableSortLabel>
          </Tooltip>
      </TableCell>
    )
  }

  public render() {
    const {stations} = this.state;
    return (
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              {this.renderTableHeaderCell('Station', 'name', false)}
              {this.renderTableHeaderCell('Entries', 'entries', true)}
              {this.renderTableHeaderCell('Exits', 'exits', true)}
              {this.renderTableHeaderCell('Total', 'total', true)}
            </TableRow>
          </TableHead>
          <TableBody>
            {stations.sort(this.getComparator()).map((station) => (
              <TableRow key={station.name}>
                <TableCell>{station.name}</TableCell>
                <TableCell numeric={true}>{numberFormatter.format(station.entries)}</TableCell>
                <TableCell numeric={true}>{numberFormatter.format(station.exits)}</TableCell>
                <TableCell numeric={true}>{numberFormatter.format(station.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    );
  }

    public getComparator() {
      return (a: IStation, b: IStation) => {
        const {sortBy, direction} = this.state;
        let diff = -1;
        if (a[sortBy] > b[sortBy]) {
          diff = 1;
        }
        if (direction === 'desc') {
          diff = -diff;
        }
        return diff;
      }
    }

    public handleSortChange = (property: string) => () => {
      const sortBy = property;
      let direction: Direction  = 'desc';
      if (this.state.sortBy === property && this.state.direction === 'desc') {
        direction = 'asc';
      }
      this.setState({direction, sortBy});
    }

}

export default App;
