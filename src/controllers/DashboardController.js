const Job = require('../model/Job')
const JobUtils = require('../utils/JobUtils')
const Profile= require('../model/Profile')

module.exports = {
    async index(req, res) {

        const jobs = await Job.get();
        const profile = await Profile.get()

        let statusCount = {
            progress:0,
            done: 0,
            total: jobs.length
        }

        let jobTotalHours = 0;

        const updatedJobs = jobs.map((job) => {

            const remaining = JobUtils.remainingDays(job)

            const status = remaining <= 0 ? 'done' : 'progress'


            /*somando mais um ao statusCount na posição status('done' ou 'progress')
             para cada elemento que o map percorrer*/
            statusCount[status] += 1;

            //? status é igual a 'progress'? Se sim, some daily hours, se não, retorne o próprio valor. Ponha em jobTotalHours
            jobTotalHours = status == 'progress' ? jobTotalHours + Number(job["daily-hours"]) : jobTotalHours

            return {
                ...job,
                remaining,
                status,
                budget: JobUtils.calculateBudget(job, profile["value-hour"])
            }
        })

        const freeHours = profile["hours-per-day"] - jobTotalHours;

        return res.render("index", {
            jobs: updatedJobs, profile, statusCount, freeHours
        })
    }
}