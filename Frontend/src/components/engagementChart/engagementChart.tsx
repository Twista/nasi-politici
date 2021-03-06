import * as React from 'react'
import classnames from 'classnames'
import NoData from 'components/emptyStates/noData/noData'
import * as am4core from '@amcharts/amcharts4/core'
import * as am4charts from '@amcharts/amcharts4/charts'
import am4themesAnimated from '@amcharts/amcharts4/themes/animated'
import styles from './engagementChart.module.scss'
import ExplanationModal from 'components/explanationModal/explanationModal'
import ReportModalTrigger from 'components/reportModal/reportModalTriggerConnected'
import { ReactComponent as ReportBtn } from 'assets/images/report.svg'

am4core.useTheme(am4themesAnimated)

const roleColors = ['#8FAECC', '#317ABE', '#435261']

interface Props {
  connections: Array<{
    company: string
    ico: string
    since: string
    until: string | null
    description: string
  }>
  fullName: string
}
const Chart: React.FC<Props> = props => {
  const [chartInstance, setChart] = React.useState<null | am4charts.XYChart>(null)
  React.useEffect(() => {
    const initial: {
      [key: string]: {
        name: string
        color: string
      }
    } = {}
    let i = 0
    const colors = props.connections.reduce((c, connection) => {
      if (!c[connection.description]) {
        c[connection.description] = {
          name: connection.description,
          color: roleColors[i] || '#cccccc',
        }
        i++
      }
      return c
    }, initial)

    let minYear = 0,
      maxYear = 0
    props.connections.forEach(c => {
      const since = new Date(c.since + '.000Z')
      const until = c.until ? new Date(c.until + '.000Z') : new Date()
      if (since.getUTCFullYear() < minYear || !minYear) minYear = since.getUTCFullYear()
      if (until.getUTCFullYear() > maxYear) maxYear = until.getUTCFullYear()
    })
    const data = props.connections.map(c => {
      return {
        fromDate: c.since,
        toDate: c.until ? c.until : new Date(),
        name: `${c.company} - ${c.description}`,
        description: c.description,
        company: c.company,
        color: colors[c.description].color,
      }
    })
    const chart = am4core.create('chartdiv', am4charts.XYChart)
    chart.hiddenState.properties.opacity = 0 // this creates initial fade-in

    chart.paddingRight = 30
    chart.dateFormatter.inputDateFormat = 'yyyy-MM-dd'

    chart.data = data
    const categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis())
    categoryAxis.dataFields.category = 'name'
    categoryAxis.renderer.grid.template.location = 0
    categoryAxis.renderer.inversed = true
    categoryAxis.renderer.align = 'left'
    categoryAxis.renderer.width = 230
    categoryAxis.renderer.fontSize = 14
    categoryAxis.renderer.labels.template.adapter.add('align', function() {
      return 'left'
    })
    categoryAxis.renderer.labels.template.adapter.add('text', function(name, type) {
      return '{company}\n{description}'
    })
    categoryAxis.renderer.labels.template.adapter.add('truncate', function() {
      return true
    })

    const dateAxis = chart.xAxes.push(new am4charts.DateAxis())
    dateAxis.dateFormatter.dateFormat = 'd.M.YYYY'
    dateAxis.renderer.minGridDistance = 50
    dateAxis.baseInterval = { count: 1, timeUnit: 'day' }
    dateAxis.strictMinMax = true
    dateAxis.contentHeight = 100
    dateAxis.renderer.opposite = true
    dateAxis.max = new Date(maxYear, 12, 31, 23, 59, 59, 0).getTime()
    dateAxis.min = new Date(minYear, 0, 1, 0, 0, 0, 0).getTime()

    const series1 = chart.series.push(new am4charts.ColumnSeries())
    series1.columns.template.width = am4core.percent(50)
    series1.columns.template.tooltipText = '{company}\n{description}\nOd: {openDateX}\nDo: {dateX}'

    series1.dataFields.openDateX = 'fromDate'
    series1.dataFields.dateX = 'toDate'
    series1.dataFields.categoryY = 'name'
    series1.columns.template.propertyFields.fill = 'color' // get color from data
    series1.columns.template.propertyFields.stroke = 'color'
    series1.columns.template.strokeOpacity = 1
    series1.columns.template.height = 20
    series1.columns.template.column.cornerRadius(10, 10, 10, 10)

    chart.scrollbarX = new am4core.Scrollbar()
    chart.scrollbarX.parent = chart.bottomAxesContainer
    setChart(chart)
  }, [props.connections])

  React.useEffect(() => {
    return (): void => {
      if (chartInstance) chartInstance.dispose()
    }
  })

  const height =
    props.connections
      .map(c => `${c.company}${c.description}`)
      .filter((name, index, self) => self.indexOf(name) === index).length * 70
  return <div id="chartdiv" style={{ height: `${height + 100}px` }}></div>
}
const EngagementChart: React.FC<Props> = props => {
  return (
    <div className={classnames(styles.widget, styles.engage, !props.connections.length && styles.noData)}>
      <div className={styles.header}>
        <div className={styles.headerTitleWrapper}>
          <h2 className={styles.title}>Angažovanost</h2>
          <ExplanationModal title="Angažovanost">
            Ne každý máme rádi pavouky. Pro zobrazení majetkových sítí jsme proto radši zvolili časové osy. Přehledným
            způsobem Vám totiž ukazují, kam až sahá napojení politiků a političek chronologicky. Tyto osy jsou ale
            poskládané z otevřených zdrojů, tudíž nemusí ukazovat úplně všechny existující vazby, zobrazují však ty
            potvrzené.
          </ExplanationModal>
        </div>
        {!!props.connections.length && (
          <div className={styles.tags}>
            <ReportModalTrigger className={styles.reportBtnWrapper} modalTitle={`${props.fullName}, angažovanost`}>
              <ReportBtn className={styles.reportBtn} />
            </ReportModalTrigger>
          </div>
        )}
      </div>
      {!props.connections.length && <NoData />}
      {!!props.connections.length && <Chart {...props} />}
    </div>
  )
}

export default EngagementChart
